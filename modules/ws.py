#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.websocket
import re
import json

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    connections = set()

    def chat(self, data):
        global radio
        if 'msg' in data.keys() and data['msg'] and 'user' in data.keys():
            user = data['user'].strip()[0:15] if data['user'] else 'anonimous'
            msg = data['msg'].strip()[0:128]
            self.send_all({'type': 'chat', 'action' : 'inMessage', 'name': user, 'msg': msg})
        return None
        
    def video(self, data): 
        global radio  
        youtubeID = re.compile("^[A-Z0-9a-z_-]{11}$")
        if data['action'] == 'add':
            if radio['qstack'].size() < 30 :
                if youtubeID.match(data['id']):
                    if radio['qstack'].push(data['id']):
                        status = 'success'
                        msg = 'Добавлено в очередь'
                        
                        self.send_all({ 'type' : 'video',  'action' : 'getQueue', 'queue' : radio['qstack'].get() })
                    else:
                        status = 'warning'
                        msg = 'Такой трек в очереди уже есть'
                else:
                    status = 'danger'
                    msg = 'ID трека не прошел валидацию'
            else:
                status = 'warning'
                msg = 'Очередь переполнена'
                
            self.send_one({'type': 'alert', 'action' : 'placeAlert', 'status': status, 'msg': msg})

        if data['action'] == 'del':
            if youtubeID.match(data['id']):
                radio['qstack'].delete(data['id'])
                logging.info(radio['qstack'].get())

        if data['action'] == 'videoPlayNext':
            if 'adminkey' in data.keys():
                with open(serverDir + '/adminkey', 'r') as f:
                    adminkey = f.readline().split()[0]
                if data['adminkey'] == adminkey:
                    if radio['qstack'].size() > 0 :
                        radio['qstack'].pop()
                        
        if data['action'] == 'videoGetCurrent':
            self.send_one({ 'type' : 'video', 'action' : 'currentvideo', 'videoid' : radio['qstack'].getCurrent(), 'time' : radio['threads'].gettime()})

        if data['action'] == 'videoGetQueue':
            self.send_one({ 'type' : 'video', 'action' : 'getQueue', 'queue' : radio['qstack'].get() })

        if data['action'] == 'videGetNext':
            if not radio['qstack'].isEmpty():
                nextID = radio['qstack'].first()
                title = radio['qstack'].getName(nextID)
                if title:
                    self.send_one({ 'type' : 'video', 'action' : 'next', 'id' : nextID, 'title' : title })
            else:
                self.send_one({ 'type' : 'video', 'action' : 'next', 'title' : 'Очередь пуста' })
        return None

    def ping(self, data):
        self.send_one({ 'type' : 'ping', 'action' : 'pong' })
        
    def opinion(self, data):
        pass

    def open(self):
        WebSocketHandler.connections.add(self)

    def on_close(self):
        WebSocketHandler.connections.remove(self)

    def on_message(self, msg):
        actions = {
            'chat':     self.chat,
            'video':    self.video,
            'ping':     self.ping,
            'opinion':  self.opinion,
        }
        global radio
        data = json.loads(msg)
        logging.info(data)
        if data['type'] and data['type'] in actions.keys():
            actions[data['type']](data)

    def send_all(self, message):
        for conn in self.connections:
            conn.write_message(message)

    def send_one(self, message):
        for conn in self.connections:
            if self == conn:
                conn.write_message(message)
