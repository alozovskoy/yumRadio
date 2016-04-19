#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.websocket
import re
import json


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    connections = set()

    def chat(self, data):
        global radio
        if data['action'] == 'sendMsg':
            if 'msg' in data.keys() and data['msg'] and 'user' in data.keys():
                user = data['user'].strip()[0:15] if data['user'] else 'anonimous'
                msg = data['msg'].strip()[0:128]
                radio['ustack'].appendName(data['userid'], user)
                self.send_all({
                    'type': 'chat',
                    'action': 'getMsg',
                    'name': user,
                    'msg': msg})
        return None
        
    def users(self, data):
        global radio
        if data['action'] in ['getUsers', 'deleteUser']:
            if 'adminkey' in data.keys():
                with open(serverDir + '/adminkey', 'r') as f:
                    adminkey = f.readline().split()[0]
                if data['adminkey'] == adminkey:
                    if data['action'] == 'getUsers':
                        self.send_one({
                            'type':     'users',
                            'action':   'getUsers',
                            'users':    radio['ustack'].get()})
                    if data['action'] == 'deleteUser':
                        radio['ustack'].delete(data['user'])
        if data['action'] == 'countInRoom':
            self.send_one({
                'type':         'users',
                'action':       'countInRoom',
                'usersCount':   str(radio['ustack'].getSizeInRoom())})
        return None

    def video(self, data):
        global radio
        youtubeID = re.compile("^[A-Z0-9a-z_-]{11}$")
        if data['action'] == 'videoAdd':
            if radio['qstack'].size() < 30:
                if youtubeID.match(data['id']):
                    if radio['qstack'].push(data['id']):
                        status = 'success'
                        msg = 'Добавлено в очередь'

                        self.send_all({
                            'type': 'video',
                            'action': 'getQueue',
                            'queue': radio['qstack'].get()})
                    else:
                        status = 'warning'
                        msg = 'Такой трек в очереди уже есть'
                else:
                    status = 'danger'
                    msg = 'ID трека не прошел валидацию'
            else:
                status = 'warning'
                msg = 'Очередь переполнена'

            self.send_one({
                'type': 'alert',
                'action': 'placeAlert',
                'status': status,
                'msg': msg})

        if data['action'] == 'videoDelete':
            if 'adminkey' in data.keys():
                with open(serverDir + '/adminkey', 'r') as f:
                    adminkey = f.readline().split()[0]
                if data['adminkey'] == adminkey:
                    radio['qstack'].delete(data['videoid'])

        if data['action'] == 'videoPlayNext':
            if 'adminkey' in data.keys():
                with open(serverDir + '/adminkey', 'r') as f:
                    adminkey = f.readline().split()[0]
                if data['adminkey'] == adminkey:
                    if radio['qstack'].size() > 0:
                        radio['qstack'].pop()

        if data['action'] == 'videoGetCurrent':
            self.send_one({
                'type': 'video',
                'action': 'currentvideo',
                'videoid': radio['qstack'].getCurrent(),
                'time': radio['threads'].gettime()})

        if data['action'] == 'videoGetQueue':
            self.send_one({
                'type': 'video',
                'action': 'getQueue',
                'queue': radio['qstack'].get()})

        if data['action'] == 'videGetNext':
            if not radio['qstack'].isEmpty():
                nextID = radio['qstack'].first()
                title = radio['qstack'].getName(nextID)
                if title:
                    self.send_one({
                        'type': 'video',
                        'action': 'next',
                        'id': nextID,
                        'title': title})
            else:
                self.send_one({
                    'type': 'video',
                    'action': 'next',
                    'title': 'Очередь пуста'})
        return None

    def ping(self, data):
        self.send_one({'type': 'ping', 'action': 'pong'})

    def opinion(self, data):
        global radio
        if data['action'] == 'set':
            if data['opinion'] not in ['like', 'dislike']:
                status = 'danger'
                msg = 'Нет такого мнения, скорее всего ты \
                    отправил что-то руками в обход предложенного кода'
            else:
                if radio['qstack'].setOpinion(data['opinion'], data['userid']):
                    status = 'success'
                    msg = 'Твое мнение учтено'
                else:
                    status = 'warning'
                    msg = 'Твой голос за этот трек уже учтен'
            self.send_one({
                'type': 'alert',
                'action': 'placeAlert',
                'status': status,
                'msg': msg})
            return None
        if data['action'] == 'check':
            opinions = radio['qstack'].getOpinions()
            if opinions:
                self.send_one({
                    'type': 'opinion',
                    'likeCount': len(opinions['like']),
                    'dislikeCount': len(opinions['dislike'])})
            return None

    def session(self, data):
        global radio
        if data['action'] == 'dropsession':
            radio['ustack'].delete(data['userid'])
            self.send_one(
                {'type': 'session', 'msg': 'Все клиенты отключены'})
            return None

    def open(self):
        WebSocketHandler.connections.add(self)

    def on_close(self):
        WebSocketHandler.connections.remove(self)

    def on_message(self, msg):
        data = json.loads(msg)
        global radio
        if data['sessionid'] == radio['ustack'].getCookie(data['userid']):
            radio['ustack'].setTime(data['userid'])
            actions = {
                'chat':     self.chat,
                'video':    self.video,
                'ping':     self.ping,
                'opinion':  self.opinion,
                'session':  self.session,
                'users':    self.users,
            }
            logging.info(data)
            if data['type'] and data['type'] in actions.keys():
                logging.info('DATA %s' % str(data))
                actions[data['type']](data)
        else:
            self.send_one({'type': 'auth', 'action': 'reauth'})

    def send_all(self, message):
        for conn in self.connections:
            conn.write_message(message)

    def send_one(self, message):
        for conn in self.connections:
            if self == conn:
                conn.write_message(message)
