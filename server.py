#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import logging
import tornado.ioloop
import tornado.web
from tornado.httpclient import AsyncHTTPClient
import tornado.httpserver
import tornado.websocket
from tornado.options import define, options
from tornado.process import Subprocess
import re
import time
import datetime
import os
import hashlib

from threading import Thread


serverDir = str(os.path.abspath(os.path.dirname(sys.argv[0])))
listenPort = 443
listenName = 'localhost'


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)-8s - %(message)s',
                    datefmt='%d/%m/%Y %Hh%Mm%Ss',
                    filename='/tmp/radio.log')

from modules import auth
with open(serverDir + '/clientkey', 'r') as f:
    auth.clientKey = f.readline().split()[0]
with open(serverDir + '/clientsecret', 'r') as f:
    auth.clientSecret = f.readline().split()[0]
    
auth.callbackURL = 'https://%s/login' % listenName

from modules import youtube
youtube.serverDir = serverDir

from modules import stack
stack.youtube = youtube
stack.serverDir = serverDir
stack.logging = logging

radio = {}

radio['qstack'] = stack.Stack()
radio['qstack'].youtube = youtube
radio['qstack'].push('ldK1gQSSTSo')
radio['qstack'].pop()

from modules import userstack
radio['ustack'] = userstack.Stack()

radio['currenttime'] = 0
radio['currentvideo'] = radio['qstack'].first()

from modules import threads
logging.info(radio['qstack'].getCurrent())
threads.setradio(radio)

radio['threads'] = threads

timethread = Thread(target=threads.threadWatcher)
timethread.setDaemon(True)
timethread.start()

likethread = Thread(target=threads.likeWatcher)
likethread.setDaemon(True)
likethread.start()


templVars = {}

class URIHandler(tornado.web.RequestHandler):

    def get(self):
        logging.info(self.request)
        global radio
        try:
            page = self.request.uri.split('?')[0]
            templVars['page'] = page
        except Exception, e:
            logging.error('ERROR: %s (%s)' % (e, Exception))
            page = '/' + self.request.uri
        if page == '/':
            page = 'index'
            
        if page.startswith('/login'):
            if self.request.uri == '/login':
                templVars['target'] = auth.getUserConfirm()
                logging.info(templVars)
                self.set_status(200)
                self.render(serverDir + '/templates/login', **templVars)
            else:
                logging.info('google')
                logging.info(self.request.uri)
                resource = auth.getResource(self.request.uri)
                userid = hashlib.sha512(resource['id']).hexdigest()
                sessionid = radio['ustack'].push(userid)
                self.set_cookie('userid', userid)
                self.set_cookie('sessionid', sessionid)
                self.redirect('/')
                return
        else:
            if not self.get_cookie('sessionid') or not self.get_cookie('userid') or self.get_cookie('sessionid') != radio['ustack'].getCookie(self.get_cookie('userid')):
                self.redirect('/login')
                return
            else:
                try:
                    pageVars = {}
                    currenttime = threads.gettime()
                    currentvideo = radio['qstack'].getCurrent()
                    pageVars['start'] = currenttime
                    pageVars['video'] = currentvideo
                    if page == '/favicon.ico':
                        self.set_status(404)
                        self.render(serverDir + '/templates/empty')
                    else:
                        if not page.startswith('/js/'):
                            self.render(serverDir + '/templates/' + page, **pageVars)
                        else:
                            self.render(serverDir + '/static/' + page, **pageVars)
                    self.set_header('Connection', 'close')
                except Exception, e:
                    logging.error('MainERROR: %s (%s)' % (e, Exception))
                    raise
                    self.set_status(404)
                    self.render(serverDir + '/templates/404', **templVars)
                    self.set_header('Connection', 'close')
                    return None

from modules import ws
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

ssl_options = { "certfile": serverDir + '/ssl/ssl.crt', "keyfile": serverDir + '/ssl/ssl.key' }

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application, ssl_options = ssl_options)
    http_server.listen(listenPort)
    tornado.ioloop.IOLoop.instance().start()
