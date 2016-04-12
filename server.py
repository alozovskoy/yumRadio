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

from threading import Thread


serverDir = str(os.path.abspath(os.path.dirname(sys.argv[0])))

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)-8s - %(message)s',
                    datefmt='%d/%m/%Y %Hh%Mm%Ss',
                    filename='/tmp/radio.log')

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

radio['currenttime'] = 0
radio['currentvideo'] = radio['qstack'].first()

from modules import threads
logging.info(radio['qstack'].getCurrent())
threads.setradio(radio)

radio['threads'] = threads

timethread = Thread(target=threads.threadWatcher)
timethread.setDaemon(True)
timethread.start()

class URIHandler(tornado.web.RequestHandler):

    def get(self):
        logging.info(self.request)
        try:
            page = self.request.uri.split('?')[0]
        except Exception, e:
            logging.error('ERROR: %s (%s)' % (e, Exception))
            page = '/' + self.request.uri
        if page == '/':
            page = 'index'
        try:
            pageVars = {}
            global radio
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
)


if __name__ == "__main__":
    application.listen(3000)
    tornado.ioloop.IOLoop.instance().start()
