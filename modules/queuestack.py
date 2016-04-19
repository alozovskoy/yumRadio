#!/usr/bin/env python
# -*- coding: utf-8 -*-

import isodate
import json


class Stack(object):

    def __init__(self):
        self.items = {}
        self.itemsList = []
        self.current = None


    def isEmpty(self):
        return len(self.itemsList) == 0

    def isEmptyMain(self):
        return len(self.items.keys()) == 0

    def size(self):
        return len(self.itemsList)

    def push(self, item):
        if item not in self.items.keys():
            title = youtube.getTitle(item)
            duration = youtube.getDuration(item)
            if title and duration:
                self.itemsList.append(item)
                self.items[item]={}
                self.items[item]['name'] = title
                self.items[item]['duration'] = int(
                    isodate.parse_duration(duration).total_seconds())
                self.items[item]['opinions'] = { 'like': [], 'dislike': [] }
                return True
            else:
                return False
        else:
            return False

    def getName(self, item):
        if item in self.items.keys():
            return self.items[item]['name']
        else:
            return None


    def getTime(self, item):
        if item in self.items.keys():
            return self.items[item]['duration']
        else:
            return None


    def getCurrent(self):
        return self.current


    def setOpinion(self, opinion, userid):
        anotherOpinion = 'dislike' if opinion == 'like' else 'like'
        if userid not in self.items[self.current]['opinions'][opinion]:
            self.items[self.current]['opinions'][opinion].append(userid)
            try:
                self.items[self.current]['opinions'][
                    anotherOpinion].remove(userid)
            except ValueError:
                pass
            return True
        else:
            return False

    def getOpinions(self):
        if self.current:
            return self.items[self.current]['opinions']
        else:
            return None


    def delete(self, item):
        if item in self.itemsList:
            self.itemsList.remove(item)
        if item in self.items.keys():
            self.items.pop(item, None)
        return None


    def first(self):
        if not self.isEmpty():
            return self.itemsList[0]
        else:
            return None

    def last(self):
        if not self.isEmpty():
            return self.itemsList[len(self.itemsList) - 1]
        else:
            return None


    def get(self):
        data = {}
        for i in enumerate(self.itemsList):
            _data = {'item': i[1], 'name': self.items[i[1]][
                'name'], 'duration': self.items[i[1]]['duration']}
            data[i[0]] = json.dumps(_data)
        return json.dumps(data)


    def pop(self):
        global currenttime
        if not self.isEmptyMain():
            self.delete(self.current)
        if not self.isEmpty():
            self.current = self.itemsList.pop(0)
        else:
            self.current = None
        currenttime = 0
        return None
