/**
 * Module dependencies.
 */
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    cors = require('cors'),
    config = require('./config');

module.exports = function(app, passport) {
    app.set('showStackError', true);

    //Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    console.log('------------ in express.js and config.root=' + config.root);
    console.log('process.env.NODE_ENV=' + process.env.NODE_ENV);
    
    
    //Setting the fav icon and static folder
    app.use(express.favicon());

    if (process.env.NODE_ENV == 'production') {
      app.use(express.static(config.root + '/public'));
    } else {
      app.use(express.static(config.root + '/views'));
    }
    // pdf routes
    app.use(express.static(config.root + '/company_data'));
      
    
    //Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'));
    }

    //Set views path, template engine and default layout
    app.set('views', config.root + '/views');
    app.set('view engine', 'jade');

    //Enable jsonp
    app.enable("jsonp callback");

    // Need to set this to whatever the client is. Otherwise it won't have access to the APIs.
    var whitelist = ['http://localhost:9000', 'http://www.litewaveinc.com'];

    // set CORS options to allow cross domain calls between our servers.
    var corsOptions = {
        origin: function(origin, callback) {
          var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
          callback(null, originIsWhitelisted);
        },
        methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true
    };
    app.use(cors(corsOptions));

    app.configure(function() {
        //cookieParser should be above session
        app.use(express.cookieParser());

        //bodyParser should be above methodOverride
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        //express/mongo session storage
        app.use(express.session({
            secret: 'HCS',
            store: new mongoStore({
                url: config.db,
                collection: 'sessions'
            })
        }));

        //connect flash for flash messages
        app.use(flash());

        //dynamic helpers
        app.use(helpers(config.app.name));

        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        //routes should be at the last
        app.use(app.router);

        // THIS HAS TO GO AT THE END AFTER IT TRIED ALL OF THE OTHER ROUTES

        //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
        app.use(function(err, req, res, next) {
            //Treat as 404
            if (~err.message.indexOf('not found')) return next();

            //Log it
            console.error(err.stack);

            //Error page
            res.status(500).render('500', {
                error: err.stack
            });
        });

        //Assume 404 since no middleware responded
        app.use(function(req, res, next) {
            res.status(404).render('404', {
                url: req.originalUrl,
                error: 'Not found'
            });
        });

    });
};
