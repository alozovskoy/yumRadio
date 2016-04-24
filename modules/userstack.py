#!/usr/bin/env python
# -*- coding: utf-8 -*-

import isodate
import json
import uuid
import hashlib

import time

class Stack(object):

    def __init__(self):
        self.items = {}
        self.usersInRoom = []
        self.ban = {}
        
    def isAdmin(self, userid):
        for item in radio['config'].get('admin', 'userid').split():
            if userid == item:
                return True
        return False

    def banUser(self, userid, description = None, bantime = None):
        if bantime is None:
            bantime = int(time.time() + 600)
        self.ban[userid] = {
            'description':  description,
            'time':         bantime}
        self.delete(userid)
        return None
    
    def getBanUser(self, userid):
        if userid in self.ban.keys():
            return self.ban[userid]
        else:
            return None
            
    def getBan(self):
        return self.ban
            
    def unbanUser(self, userid):
        self.ban.pop(userid, None)
        return None
        
    def isBan(self, userid):
        if userid in self.ban.keys():
            return True
        else:
            return False
        
    def addToRoom(self, item):
        if item not in self.usersInRoom:
            self.usersInRoom.append(item)
        return None
        
    def removeFromRoom(self, item):
        if item in self.usersInRoom:
            self.usersInRoom.remove(item)
        return None
        
    def getUsersInRoom(self):
        return self.usersInRoom

    def isEmpty(self):
        return len(self.items.keys()) == 0

    def getCookie(self, item):
        if item in self.items.keys():
            return self.items[str(item)]['cookie']
        else:
            return None

    def getNames(self, item):
        if item in self.items.keys():
            return self.items[str(item)]['names']
        else:
            return None

    def push(self, item):
        if self.isBan(item):
            return None
        self.setTime(str(item))
        self.addToRoom(str(item))
        if item not in self.items.keys():
            self.items[str(item)] = {}
            self.items[str(item)]['names'] = []
            self.items[str(item)]['cookie'] = hashlib.sha512(str(uuid.uuid1())).hexdigest()
            return self.items[str(item)]['cookie']
        else:
            return self.items[str(item)]['cookie']

    def appendName(self, item, name):
        if item in self.items.keys():
            if name not in self.items[str(item)]['names']:
                self.items[str(item)]['names'].append(name)
                return True
            else:
                return False
        else:
            return False

    def popName(self, item):
        if item in self.items.keys():
            if self.items[item]['names']:
                self.items[item]['names'].remove(self.items[item]['names'][0])
        return None

    def size(self):
        return len(self.items)
        
    def getInRoom(self):
        return self.usersInRoom
        
    def getSizeInRoom(self):
        return len(self.usersInRoom)

    def getAll(self):
        return self.items.keys()

    def delete(self, item):
        self.items.pop(item, None)
        self.removeFromRoom(item)
        return None

    def get(self):
        data = {}
        for i in enumerate(self.items.keys()):
            _data = {
                'item': i[1],
                'cookie': self.items[i[1]]['cookie'],
                'names': self.items[i[1]]['names'],
                'lasttime': self.items[i[1]]['lasttime']}
            data[i[0]] = json.dumps(_data)
        return json.dumps(data)
        
    def setTime(self, userid):
        if userid in self.items.keys():
            self.items[userid]['lasttime'] = int(time.time())
        return None
        
    def getTime(self, userid):
        if userid in self.items.keys() and \
                'lasttime' in self.items[userid].keys():
            return self.items[userid]['lasttime']
        else:
            return 0
