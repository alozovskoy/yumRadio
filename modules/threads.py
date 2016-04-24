#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time

currenttime = 0

radio = ''


def writelog(data):
    f = open('/tmp/threads.log', 'a')
    f.write(str(data) + '\n')
    f.close()


def setradio(value):
    global radio
    radio = value


def gettime():
    global currenttime
    return str(currenttime)


def videoTimeWatcher():
    global currenttime
    global radio
    while True:
        videoID = radio['qstack'].getCurrent()
        videoTime = None
        if not videoID:
            while radio['qstack'].isEmpty():
                time.sleep(0.1)
            radio['qstack'].pop()
            continue
        videoTime = radio['qstack'].getTime(videoID)
        if not videoTime:
            time.sleep(1)
            continue
        _time = 0
        while _time < videoTime:
            if radio['qstack'].getCurrent() == videoID:
                time.sleep(0.1)
                _time += 0.1
                currenttime = int(_time)
            else:
                break
        if radio['qstack'].getCurrent() == videoID:
            radio['qstack'].pop()


def videoLikeWatcher():
    global radio
    while True:
        opinions = radio['qstack'].getOpinions()
        userCount = radio['ustack'].getSizeInRoom()
        if userCount and opinions:
            dislikeCount = float(len(opinions['dislike']))
            likeCount = float(int(userCount) + int(len(opinions['like'])))
            if (dislikeCount * 100 / likeCount) > 50:
                radio['qstack'].pop(True)
        time.sleep(1)

def userActivityWatcher():
    global radio
    while True:
        users = radio['ustack'].getAll()
        nowTime = int(time.time())
        for item in users:
            userTime = radio['ustack'].getTime(item)
            if nowTime - userTime > 300:
                radio['ustack'].removeFromRoom(item)
            if nowTime - userTime > 900:
                radio['ustack'].delete(item)
        time.sleep(10)

def banWatcher():
    global radio
    while True:
        ban = radio['ustack'].getBan()
        nowTime = int(time.time())
        for user in ban.keys():
            userBanTime = ban[user]['time']
            if nowTime > userBanTime:
                radio['ustack'].unbanUser(user)       
        time.sleep(10)

def configWatcher():
    global radio
    while True:
        radio['config'].load()
        time.sleep(60)

def userPopNameWatcher():
    global radio
    while True:
        users = radio['ustack'].getAll()
        if users:
            for user in users:
                radio['ustack'].popName(user)
        time.sleep(60)
        
def userNamesWatcher():
    global radio
    while True:
        users = radio['ustack'].getAll()
        if users:
            for user in users:
                names = radio['ustack'].getNames(user)
                if names and len(names) > 10:
                    radio['ustack'].banUser(user, 'использование большого количества ников', time.time() + 300)
        time.sleep(60)
