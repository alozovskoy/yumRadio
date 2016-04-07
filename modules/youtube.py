#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import urllib2

serverDir = ''

def getTitle(videoid):
    title = None
    with open(serverDir + '/apikey', 'r') as f:
        apikey = f.readline().split()[0]
    url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=%s&fields=items%%2Fsnippet(title)&key=%s' % (videoid, apikey)
    data = urllib2.urlopen(url)
    if data.code == 200:
        answer = json.loads(data.read())
        if len(answer['items']) == 1:
            title = answer['items'][0]['snippet']['title']
    return title
    
def getDuration(videoid):
    duration = None
    with open(serverDir + '/apikey', 'r') as f:
        apikey = f.readline().split()[0]
    url = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=%s&fields=items%%2FcontentDetails(duration)&key=%s' % (videoid, apikey)
    data = urllib2.urlopen(url)
    if data.code == 200:
        answer = json.loads(data.read())
        if len(answer['items']) == 1:
            duration = answer['items'][0]['contentDetails']['duration']
    return duration
