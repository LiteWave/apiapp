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

`fab deploy:prod`

Server available at:

`www.litewaveinc.com/api`
