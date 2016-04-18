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


def threadWatcher():
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
                writelog(currenttime)
                time.sleep(0.1)
                _time += 0.1
                currenttime = int(_time)
            else:
                break
        if radio['qstack'].getCurrent() == videoID:
            radio['qstack'].pop()


def likeWatcher():
    global radio
    while True:
        opinions = radio['qstack'].getOpinions()
        userCount = radio['ustack'].size()
        if userCount and opinions:
            dislikeCount = float(len(opinions['dislike']))
            likeCount = float(int(userCount) + int(len(opinions['like'])))
            if (dislikeCount * 100 / likeCount) > 50:
                radio['qstack'].pop()
        time.sleep(1)
