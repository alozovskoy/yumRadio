#!/usr/bin/env python
# -*- coding: utf-8 -*-

import isodate
import json
import uuid


class Stack(object):
    def __init__(self):
        self.items = {}

    def isEmpty(self):
        return len(self.items.keys()) == 0

    def getCookie(self, item):
        if item in self.items.keys():
            return self.items[str(item)]['cookie']
        else:
            return None
            
    def getNames(self, item):
        if item in items.keys():
            return self.items[str(item)]['names']
        else:
            return None

    def push(self, item):
        if not item in self.items.keys():
            self.items[str(item)] = {}
            self.items[str(item)]['names'] = []
            self.items[str(item)]['cookie'] = str(uuid.uuid1())
            return self.items[str(item)]['cookie']
        else:
            return self.items[str(item)]['cookie']

    def appendName(self, item, name):
        if item in items.keys():
            if name not in self.items[str(item)]['names']:
                self.items[str(item)]['names'].append(name)
                return True
            else:
                return False
        else:
            return False

    def size(self):
        return len(self.items)

    def delete(self, item):
        self.items.pop(item, None)
        return None

    def get(self):
        data = {}
        for i in enumerate(self.items.keys()):
            _data = { 'item' : i[1], 'cookie' : self.items[i[1]]['cookie'], 'names' : self.items[i[1]]['names'] }
            data[i[0]] = json.dumps(_data)
        return json.dumps(data)