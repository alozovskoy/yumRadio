#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib2
import json
from urllib import urlencode
from urlparse import parse_qsl, urlparse
import random


authURL = 'https://accounts.google.com/o/oauth2/auth'
accessURL = 'https://www.googleapis.com/oauth2/v3/token'
apiURL = 'https://www.googleapis.com/oauth2/v1/userinfo'

state = str(random.getrandbits(64))


def getUserConfirm():
    auth_params = {
        "client_id": clientKey,
        "state": state,
        "redirect_uri": callbackURL,
        "scope": "openid",
        "response_type": "code",
    }
    url = '?'.join([authURL, urlencode(auth_params)])
    return url


def getResource(data):
    auth_params = {
        "client_id": clientKey,
        "state": state,
        "redirect_uri": callbackURL,
        "scope": "openid",
        "response_type": "code",
    }
    redirect_params = dict(parse_qsl(urlparse(data).query))
    if redirect_params['state'] == auth_params['state']:
        authCode = redirect_params['code']
        access_token_params = {
            'client_id':        clientKey,
            'redirect_uri':     callbackURL,
            'client_secret':    clientSecret,
            'code':             authCode,
            'grant_type':       'authorization_code'
        }
        resp = urllib2.urlopen(accessURL, data=urlencode(access_token_params))
        assert resp.code == 200
        resp_content = json.loads(resp.read())
        access_token = resp_content['access_token']
        api_params = {
            'access_token': access_token,
        }
        url = "?".join([apiURL, urlencode(api_params)])
        resp = urllib2.urlopen(url)
        assert resp.code == 200
        resp_content = json.loads(resp.read())
        return resp_content
    else:
        return None
    
