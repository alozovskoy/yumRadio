#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import logging
import re
import time
import datetime
import os
import hashlib
from threading import Thread

import tornado.ioloop
import tornado.web
from tornado.httpclient import AsyncHTTPClient
import tornado.httpserver
import tornado.websocket
from tornado.options import define, options
from tornado.process import Subprocess

from modules import *

serverDir = str(os.path.abspath(os.path.dirname(sys.argv[0])))

radio = {}

radio['config'] = config.config(serverDir + '/radio.conf')

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)-8s - %(message)s',
                    datefmt='%d/%m/%Y %Hh%Mm%Ss',
                    filename=radio['config'].get('server', 'log'))


auth.radio = radio
userstack.radio = radio

auth.callbackURL = '%s://%s/login' % (radio['config'].get('server', 'protocol'), radio['config'].get('server', 'name'))


youtube.radio = radio


queuestack.youtube = youtube
queuestack.serverDir = serverDir
queuestack.logging = logging

def sendMsg(msg):
    for client in radio['wsClients']:
        client.write_message(msg)
    return None

radio['wsClients'] = []
radio['sendMsg'] = sendMsg

queuestack.sendMsg = sendMsg

radio['qstack'] = queuestack.Stack()
radio['qstack'].youtube = youtube

radio['ustack'] = userstack.Stack()

radio['currenttime'] = 0
radio['currentvideo'] = radio['qstack'].first()

threads.setradio(radio)

radio['threads'] = threads

videoTimeThread = Thread(target=threads.videoTimeWatcher)
videoTimeThread.setDaemon(True)
videoTimeThread.start()

likeThread = Thread(target=threads.videoLikeWatcher)
likeThread.setDaemon(True)
likeThread.start()

userActivityThread = Thread(target=threads.userActivityWatcher)
userActivityThread.setDaemon(True)
userActivityThread.start()

userBanThread = Thread(target=threads.banWatcher)
userBanThread.setDaemon(True)
userBanThread.start()

configThread = Thread(target=threads.configWatcher)
configThread.setDaemon(True)
configThread.start()

templVars = {}


class URIHandler(tornado.web.RequestHandler):

    def get(self):
        logging.debug('Request: %s' % self.request)
        global radio
        try:
            page = self.request.uri.split('?')[0]
            templVars['page'] = page
        except Exception, e:
            logging.error('ERROR: %s (%s)' % (e, Exception))
            page = '/' + self.request.uri
        if page == '/':
            page = '/index.html'

        if page.startswith(('/login', '/static', '/favicon.ico', '/ban', '/404')):
            contentType = ''
            if page == '/favicon.ico':
                page = '/static/img/favicon.ico'
                contentType = 'image/x-icon'
            if page.startswith('/static'):
                with open(serverDir + page,'r') as staticfile:
                    if contentType:
                        self.set_header("Content-Type", contentType)
                    self.write(staticfile.read())
            else:
                try:
                    if page in ['/login', '/login.html']:
                        if self.request.uri in ['/login', '/login.html']:
                            templVars['target'] = auth.getUserConfirm()
                            self.set_status(200)
                            self.render(serverDir + '/templates/login.html', **templVars)
                            return
                        else:
                            resource = auth.getResource(self.request.uri)
                            if resource:
                                userid = hashlib.sha512(resource['id']).hexdigest()
                                sessionid = radio['ustack'].push(userid)
                                if sessionid:
                                    self.set_cookie('userid', userid)
                                    self.set_cookie('sessionid', sessionid)
                                    self.redirect('/')
                                    return
                                else:
                                    self.redirect('/ban')
                                    return
                            else:
                                self.redirect('/login')
                                return
                    elif self.request.uri in ['/ban', '/ban.html']:
                        self.set_status(200)
                        self.render(serverDir + '/templates/ban.html', **templVars)
                        return
                    else:
                        self.redirect('/login')
                        return
                except Exception, e:
                    logging.error('MainERROR: %s (%s)' % (e, Exception))
                    raise
                    self.set_status(404)
                    self.render(serverDir + '/templates/404.html', **templVars)
        else:

            userid = self.get_cookie('userid')
            sessionid = self.get_cookie('sessionid')
            
            if not sessionid or not userid or \
                    sessionid != radio['ustack'].getCookie(userid):
                self.redirect('/login')
                return
            elif radio['ustack'].isBan(userid):
                self.redirect('/ban')
                return
            else:
                pageVars = {}
                pageVars['page'] = page
                try:
                    currenttime = threads.gettime()
                    currentvideo = radio['qstack'].getCurrent()
                    pageVars['start'] = currenttime
                    pageVars['video'] = currentvideo
                    self.set_status(200)
                    if not page.endswith('html'):
                        page = page + '.html'
                    self.render(serverDir + '/templates/' + page, **pageVars)
                except Exception, e:
                    logging.error('MainERROR: %s (%s)' % (e, Exception))
                    raise
                    self.set_status(404)
                    self.render(serverDir + '/templates/404.html', **templVars)
        self.set_header('Connection', 'close')
        
ws.radio = radio
ws.logging = logging
ws.threads = threads
ws.serverDir = serverDir


application = tornado.web.Application([
    (r'/ws', ws.WebSocketHandler),
    (r'.*', URIHandler),
],
    debug=radio['config'].getBool('server', 'debug'),
)

if __name__ == "__main__":
    
    if radio['config'].getBool('ssl', 'enable'):
        ssl_options = {
                    "certfile": radio['config'].get('ssl', 'cert'),
                    "keyfile":  radio['config'].get('ssl', 'key')}
        http_server = tornado.httpserver.HTTPServer(
            application, ssl_options=ssl_options)
    else:
        http_server = tornado.httpserver.HTTPServer(application)
        
    if radio['config'].get('server', 'listen'):
        http_server.listen(radio['config'].get('server', 'port'), address=radio['config'].get('server', 'listen'))
    else:
        http_server.listen(radio['config'].get('server', 'port'))
    tornado.ioloop.IOLoop.instance().start()
