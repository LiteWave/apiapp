#!/usr/bin/env bash

. env/bin/activate

# stop running node with forever
forever stopall

# set environment and run server with forever
NODE_ENV=production forever start /var/www/apiapp/server/server.js

deactivate_node
