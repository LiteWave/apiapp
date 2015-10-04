#!/usr/bin/env bash

#set environment and run server
NODE_ENV=production forever start /var/www/apiapp/server/server.js
