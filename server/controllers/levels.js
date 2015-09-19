/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Level = mongoose.model('Level'),
    _ = require('underscore');

/**
 * Find Level by id
 */
exports.level = function (req, res, next, id)
{
  Level.load(id, function (err, level)
  {
    if (err) return next(err);
    if (!level) return next(new Error('Failed to load level:' + id));
    req.level = level;
    next();
  });
};

/**
 * Find Level by id
 */
exports.levelname = function (req, res, next, name)
{
  console.log('Level:name=' + name);
  Level.loadName(name, function (err, level)
  {
    if (err) return next(err);
    if (!level) return next(new Error('Failed to load level:' + id));
    req.level = level;
    next();
  });
};

/**
 * 
 */
exports.create = function (req, res)
{
  var level = new Level(req.body);
  console.log('Level:Create:level.name=' + level.name);

  level.save(function (err)
  {
    console.log('level:Create:err=' + err);
    if (err)
    {
      return res.send('sections', {
        errors: err.errors,
        level: level
      });
    }
    else
    {
      res.jsonp(level);
    }
  });
};

/**
 * Update a level
 */
exports.update = function (req, res)
{
  var level = req.level;
  level = _.extend(level, req.body);
  level.save(function (err)
  {
    res.jsonp(level);
  });
};


/**
 * Delete an level
 */
exports.destroy = function (req, res)
{
  var level = req.level;

  level.remove(function (err)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(level);
    }
  });
};

/**
 * Show a level
 */
exports.show = function (req, res)
{
  res.jsonp(req.level);
};

/**
 * List of sections
 */
exports.all = function (req, res)
{
  Level.find().exec(function (err, levels)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(levels);
    }
  });
};