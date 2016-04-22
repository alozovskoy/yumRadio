#!/usr/bin/env python
# -*- coding: utf-8 -*-

from ConfigParser import SafeConfigParser

class config:
    def __init__(self, fname):
        self.filename = fname
        self.cfgParser = SafeConfigParser()
        self.cfgParser.read(self.filename)

    def load(self):
        self.cfgParser.read(self.filename)

    def get(self, section, key):
        return self.cfgParser.get(section, key)
        
    def getBool(self, section, key)
        if self.cfgParser.get(section, key).lower() in ['true', 'yes', 'y']:
            return True
        else:
            return False
