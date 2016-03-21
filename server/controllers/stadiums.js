/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Level = mongoose.model('Level'),
    Stadium = mongoose.model('Stadium'),
    _ = require('underscore');

    // Declare global var.
    inMemoryCache = require('memory-cache');
    cacheTimeInMs = 60000;

/**
 * Find stadium by id
 */
exports.stadium = function (req, res, next, id)
{
  Stadium.load(id, function (err, stadium)
  {
    if (err) return next(err);
    if (!stadium) return next(new Error('Failed to load stadium ' + id));
    req.stadium = stadium;
    next();
  });
};

/**
 * 
 */
exports.create = function (req, res)
{
  var stadium = new Stadium(req.body);

  stadium.save(function (err)
  {
    console.log('Stadium:Create:err=' + err);
    if (err)
    {
      return res.send('stadiums', {
        errors: err.errors,
        stadium: stadium
      });
    }
    else
    {
      res.jsonp(stadium);
    }
  });
};

/**
 * Update a stadium
 */
exports.update = function (req, res)
{
  var stadium = req.stadium;
  stadium = _.extend(stadium, req.body);
  stadium.save(function (err)
  {
    res.jsonp(stadium);
  });
};


/**
 * Delete an stadium
 */
exports.destroy = function (req, res)
{
  var stadium = req.stadium;

  stadium.remove(function (err)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(stadium);
    }
  });
};

/**
 * Show a stadium
 */
exports.show = function (req, res)
{
  res.jsonp(req.stadium);
};

/**
 * Show a stadium by client id
 */
exports.showbyclient = function (req, res)
{
  Stadium.find({ _clientId: req.client._id }).exec(function (err, stadiums)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(stadiums);
    }
  });
};

/**
 * Show a stadium by client id
 */
exports.showbylevel = function (req, res)
{
  // decode name of level
  var levelName = decodeURIComponent(req.params.levelName);

  Stadium.findOne({ _id: req.stadium._id }).exec(function (err, stadium)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    }
    else
    {
      if (stadium)
      {
        var count = stadium.levels.length;
        var levelId;
        for (var i = 0; i < count; i++)
        {
          if (stadium.levels[i].name === levelName)
          {
            levelId = stadium.levels[i]._levelId;
            break;
          }  
        }

        // Do we already have this level in our memory cache?
        var level = inMemoryCache.get(levelId);
        if (level)
        {
          //console.log('ShowByLevel:level. Level found in cache.');
          res.jsonp(level);
          return;
        }
        else
        {
          //console.log('ShowByLevel:level. Level NOT found in cache.');
        }

        Level.findOne({ _id: levelId }).exec(function (err, level)
        {
          if (err)
          {
            res.render('error', {
              status: 404
            });
          }

          // Save this level by its _id to the memory cache.          
          inMemoryCache.put(levelId, level, cacheTimeInMs);

          res.jsonp(level);
        });
      }
    }
  });
};

/**
 * List of Stadiums 
 */
exports.all = function (req, res)
{
  Stadium.find().exec(function (err, stadiums)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(stadiums);
    }
  });
};