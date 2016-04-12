#!/usr/bin/env python
# -*- coding: utf-8 -*-

import isodate
import json

class Stack(object):
    def __init__(self):
        self.items = {}
        self.itemsList = []
        self.current = ''
        
    def getName(self, item):
        if item in self.items.keys():
            return self.items[item]['name']
        else:
            return None

    def getCurrent(self):
        return self.current

    def getTime(self, item):
        if item in self.items.keys():
            return self.items[item]['duration']
        else:
            return None

    def isEmpty(self):
        return len(self.itemsList) == 0

    def push(self, item):
        if not item in self.items.keys():
            title = youtube.getTitle(item)
            duration = youtube.getDuration(item)
            if title and duration:
                self.items[str(item)] = {}
                self.itemsList.append(str(item))
                self.items[str(item)]['name'] = title
                self.items[str(item)]['duration'] = int(isodate.parse_duration(duration).total_seconds())
                return True
            else:
                return False
        else:
            return False

    def pop(self):
        if not self.isEmpty():
            self.current = self.itemsList.pop(0)
        return None

    def last(self):
        if not self.isEmpty():
            return self.itemsList[len(self.itemsList)-1]
        else:
            return None

    def first(self):
        if not self.isEmpty():
            return self.itemsList[0]
        else:
            return None

    def size(self):
        return len(self.itemsList)

    def delete(self, item):
        self.itemsList.remove(item)
        self.items.pop(item, None)
        return None

    def get(self):
        data = {}
        for i in enumerate(self.items.keys()):
            _data = { 'item' : i[1], 'name' : self.items[i[1]]['name'], 'duration' : self.items[i[1]]['duration'] }
            data[i[0]] = json.dumps(_data)
        return json.dumps(data)
