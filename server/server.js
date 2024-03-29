/*jslint node: true */
'use strict';
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    logger = require('mean-logger');


//Load configurations
//if test env, load example file
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('./config/config'),
    auth = require('./config/middlewares/authorization'),
    mongoose = require('mongoose');

//Bootstrap db connection
var db = mongoose.connect(config.db);

console.log('ready to set up bootstrap models');

//Bootstrap models
var models_path = __dirname + '/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};

console.log('calling walk with path:' + models_path);

walk(models_path);
    
console.log('ready to do passport config');

//bootstrap passport config
require('./config/passport')(passport);

var app = express();    

console.log('ready to load express settings');

//express settings
require('./config/express')(app, passport);

console.log('ready to load routes');

//Bootstrap routes
require('./config/routes')(app, passport, auth);



//Start the app by listening on <port> 
var port = config.port;
console.log('ready to listen on port: ' + port);
app.listen(port);
console.log('Express app started on port ' + port);

//Initializing logger
logger.init(app, passport, mongoose);

//expose app
exports = module.exports = app;