# apiapp

The api app for Litewave

## Setup

Install Node Virtual Environment 

`sudo pip install nodeenv`

`nodeenv env`

Activate your nodeenv:

`. env/bin/activate`

Install the npm plugins:

`npm install`

Install forever:

`pip install forever`

## Running locally

`node server/server.js`

Server available at:

`http://localhost:3000/api`

## Deployment

Add your permission file via ssh-add. Otherwise you can't connect to the remote servers.
Make sure the fab file is updated with the correct list of server IP addresses from AWS. 

`fab deploy_prod:master`

`fab deploy_stage:master`

Server available at:

`www.litewaveinc.com/api`
