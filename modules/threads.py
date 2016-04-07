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
        while not videoTime:
            videoTime = radio['qstack'].getTime(videoID)
        _time = 0
        while _time < videoTime:
            if radio['qstack'].getCurrent() == videoID:
                time.sleep(0.1)
                _time += 0.1
                currenttime = int(_time)
            else:
                currenttime = 0
                break
        if radio['qstack'].getCurrent() == videoID:
            radio['qstack'].pop()
