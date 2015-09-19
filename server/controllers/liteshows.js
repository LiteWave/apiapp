/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Command = mongoose.model('Command'),
    _ = require('underscore');
 

/**
 * Find liteshow by id
 */
exports.command = function(req, res, next, id) {
  Command.load(id, function (err, liteshow) {
        if (err) return next(err);
        if (!liteshow) return next(new Error('Failed to load liteshow ' + id));
        req.liteshow = liteshow;
        next();
    });
};

/**
 * 
 */
exports.create = function(req, res) {
    
  var liteshow = new LiteShow(req.body);

  liteshow.save(function(err) {
      if (err) {
          return res.send('liteshows', {
              errors: err.errors,
              liteshow: liteshow
          });
      } else {
          res.jsonp(liteshow);
      }
  });
};

/**
 * Update a liteshow
 */
exports.update = function(req, res) {
    var liteshow = req.liteshow;
    liteshow = _.extend(liteshow, req.body);
    liteshow.save(function(err) {
        res.jsonp(liteshow);
    });
};


/**
 * Delete an liteshow
 */
exports.destroy = function(req, res) {
    var liteshow = req.liteshow;

    liteshow.remove(function(err) {
        if (err) {
            res.render('error', {
              status: 400
            });
        } else {
            res.jsonp(liteshow);
        }
    });
};

/**
 * Show a liteshow
 */
exports.show = function(req, res) {
    res.jsonp(req.liteshow);
};

/**
 * List of LiteShows 
 */
exports.all = function(req, res) {
    LiteShow.find().exec(function(err, liteshows) {
       if (err) {
            res.render('error', {
              status: 404
            });
        } else {
            res.jsonp(liteshows);
        }
    });
};