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
                    'type':     'chat',
                    'action':   'getMsg',
                    'sender':   'user',
                    'name':     user,
                    'msg':      msg})
        return None
        
    def users(self, data):
        global radio
        if data['action'] in ['getUsers', 'deleteUser', 'ban', 'unban', 'getBan']:
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
                    if data['action'] == 'ban':
                        description = data['description'] if 'description' in data.keys() else None
                        bantime = data['bantime'] if 'bantime' in data.keys() else None
                        radio['ustack'].banUser(data['banid'], description = description, bantime = bantime)
                    if data['action'] == 'unban':
                        radio['ustack'].unbanUser(data['unbanid'])
                    if data['action'] == 'getBan':
                        self.send_one({
                            'type':     'users',
                            'action':   'getBan',
                            'ban':      json.dumps(radio['ustack'].getBan())})
        if data['action'] == 'countInRoom':
            self.send_one({
                'type':         'users',
                'action':       'countInRoom',
                'usersCount':   str(radio['ustack'].getSizeInRoom())})
        if data['action'] == 'getNicknames':
            self.send_one({
                'type':         'users',
                'action':       'getNickNames',
                'nicknames':    json.dumps(radio['ustack'].getNames(data['userid']))})
        return None

    def video(self, data):
        global radio
        youtubeID = re.compile("^[A-Z0-9a-z_-]{11}$")
        if data['action'] == 'videoAdd':
            if radio['qstack'].size() < 30:
                if youtubeID.match(data['id']):
                    if radio['qstack'].getCurrent() == data['id']:
                        status = 'warn'
                        msg = "Этот трек сейчас воспроизводится"
                    else:
                        if radio['qstack'].push(data['id'], data['userid']):
                            status = 'success'
                            msg = 'Добавлено в очередь'
    
                            self.send_all({
                                'type': 'video',
                                'action': 'getQueue',
                                'queue': radio['qstack'].get()})
                        else:
                            status = 'warn'
                            msg = 'Такой трек в очереди уже есть'
                else:
                    status = 'error'
                    msg = 'ID трека не прошел валидацию'
            else:
                status = 'warn'
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
            admin = False
            if 'adminkey' in data.keys():
                with open(serverDir + '/adminkey', 'r') as f:
                    adminkey = f.readline().split()[0]
                if data['adminkey'] == adminkey:
                    admin = True
            self.send_one({
                'type': 'video',
                'action': 'getQueue',
                'queue': radio['qstack'].get(admin)})

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
        global radio
        radio['wsClients'].append(self)
        WebSocketHandler.connections.add(self)

    def on_close(self):
        global radio
        radio['wsClients'].remove(self)
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
            logging.debug('wsData: %s' % data)
            if data['type'] and data['type'] in actions.keys():
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
