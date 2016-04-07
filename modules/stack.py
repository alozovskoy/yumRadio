#!/usr/bin/env python
# -*- coding: utf-8 -*-

import isodate
import json

class Stack(object):
    def __init__(self):
        self.items = []
        self.names = {}
        self.duration = {}
        self.current = ''
        
    def getName(self, item):
        if item in self.names.keys():
            return self.names[item]
        else:
            return None

    def getCurrent(self):
        return self.current

    def getTime(self, item):
        if item in self.duration.keys():
            return self.duration[item]
        else:
            return None

    def isEmpty(self):
        return self.items == []

    def push(self, item):
        if not item in self.items:
            title = youtube.getTitle(item)
            duration = youtube.getDuration(item)
            if title and duration:
                self.items.append(str(item))
                self.names[item] = title
                self.duration[item] = int(isodate.parse_duration(duration).total_seconds())
                return True
            else:
                return False
        else:
            return False

    def pop(self):
        if not self.isEmpty():
            self.current = self.items.pop(0)
            logging.info(self.current)
        return None

    def last(self):
        return self.items[len(self.items)-1]

    def first(self):
        if not self.isEmpty():
            return self.items[0]
        else:
            return None

    def size(self):
        return len(self.items)

    def delete(self, item):
        self.items.remove(item)
        return None

    def get(self):
        data = {}
        for i in enumerate(self.items):
            _data = { 'item' : i[1], 'name' : self.names[i[1]], 'duration' : self.duration[i[1]] }
            data[i[0]] = json.dumps(_data)
        return json.dumps(data)
