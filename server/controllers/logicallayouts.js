/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    LogicalLayout = mongoose.model('LogicalLayout'),
    _ = require('underscore');

/**
 * Find logicallayout by id
 */
exports.logicallayout = function (req, res, next, id)
{
  LogicalLayout.load(id, function (err, logicallayout)
  {
    if (err) return next(err);
    if (!logicallayout) return next(new Error('Failed to load logicallayout ' + id));
    req.logicallayout = logicallayout;
    next();
  });
};

/**
 * 
 */
exports.create = function (req, res)
{
  var logicallayout = new LogicalLayout(req.body);
  //logicallayout._stadiumId = req.params.stadiumId;
  logicallayout.save(function (err)
  {
    if (err)
    {
      return res.send('shows/', {
        errors: err.errors,
        logicallayout: logicallayout
      });
    } else
    {
      res.jsonp(logicallayout);
    }
  });
};

/**
 * Update a logicallayout
 */
exports.update = function (req, res)
{
  var logicallayout = req.logicallayout;
  logicallayout = _.extend(logicallayout, req.body);

  logicallayout.save(function (err)
  {
    res.jsonp(logicallayout);
  });
};


/**
 * Delete an logicallayout
 */
exports.destroy = function (req, res)
{
  var logicallayout = req.logicallayout;
  logicallayout.remove(function (err)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(logicallayout);
    }
  });
};

/**
 * Show a specific LogicalLayout
 */
exports.show = function (req, res)
{
  res.jsonp(req.logicallayout);
};

/**
 * List of Layouts for a Stadium
 */
exports.all = function (req, res)
{
  LogicalLayout.find().exec(function (err, logicallayouts)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(logicallayouts);
    }
  });
};
