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
listenPort = 443
listenName = 'localhost'


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)-8s - %(message)s',
                    datefmt='%d/%m/%Y %Hh%Mm%Ss',
                    filename='/tmp/radio.log')


with open(serverDir + '/clientkey', 'r') as f:
    auth.clientKey = f.readline().split()[0]
with open(serverDir + '/clientsecret', 'r') as f:
    auth.clientSecret = f.readline().split()[0]

auth.callbackURL = 'https://%s/login' % listenName


youtube.serverDir = serverDir


queuestack.youtube = youtube
queuestack.serverDir = serverDir
queuestack.logging = logging

radio = {}

radio['qstack'] = queuestack.Stack()
radio['qstack'].youtube = youtube


radio['ustack'] = userstack.Stack()

radio['currenttime'] = 0
radio['currentvideo'] = radio['qstack'].first()


threads.setradio(radio)

radio['threads'] = threads

timethread = Thread(target=threads.threadWatcher)
timethread.setDaemon(True)
timethread.start()

likethread = Thread(target=threads.likeWatcher)
likethread.setDaemon(True)
likethread.start()

userthread = Thread(target=threads.userWatcher)
userthread.setDaemon(True)
userthread.start()

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
            page = 'index'

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
                    if page == '/login':
                        if self.request.uri == '/login':
                            templVars['target'] = auth.getUserConfirm()
                            self.set_status(200)
                            self.render(serverDir + '/templates/login', **templVars)
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
                    elif self.request.uri == '/ban':
                        self.set_status(200)
                        self.render(serverDir + '/templates/ban', **templVars)
                        return
                    else:
                        self.redirect('/login')
                        return
                except Exception, e:
                    logging.error('MainERROR: %s (%s)' % (e, Exception))
                    raise
                    self.set_status(404)
                    self.render(serverDir + '/templates/404', **templVars)
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
                    self.render(serverDir + '/templates/' + page, **pageVars)
                except Exception, e:
                    logging.error('MainERROR: %s (%s)' % (e, Exception))
                    raise
                    self.set_status(404)
                    self.render(serverDir + '/templates/404', **templVars)
        self.set_header('Connection', 'close')
        
ws.radio = radio
ws.logging = logging
ws.threads = threads
ws.serverDir = serverDir

application = tornado.web.Application([
    (r'/ws', ws.WebSocketHandler),
    (r'.*', URIHandler),
],
    debug=True,
    cookie_secret="nieg+eiy8Aeki,a7faeferuh"
)

ssl_options = {"certfile": serverDir + '/ssl/ssl.crt',
               "keyfile": serverDir + '/ssl/ssl.key'}

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(
        application, ssl_options=ssl_options)
    http_server.listen(listenPort)
    tornado.ioloop.IOLoop.instance().start()
