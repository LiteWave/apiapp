#!/usr/bin/env bash

. env/bin/activate

# stop running node with forever
forever stopall

# set environment and run server with forever
env = $1
if [ $# -eq 0 ]
  then
    env = "production"
fi
NODE_ENV=$1 forever start /var/www/apiapp/server/server.js

deactivate_node
