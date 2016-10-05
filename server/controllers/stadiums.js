/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Level = mongoose.model('Level'),
    Stadium = mongoose.model('Stadium'),
    _ = require('underscore');

    // Declare global var.
    LWStadiumInMemoryCache = require('memory-cache');
    LWStadiumCacheTimeInMs = 60000;

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
//    console.log('Stadium:Create:err=' + err);
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
  var cacheKey = req.client._id;

  // Do we already have this level in our memory cache?
  var stadiums = LWStadiumInMemoryCache.get(cacheKey);
  if (stadiums)
  {
    //console.log('ShowByClient:stadium. stadium found in cache.');
    res.jsonp(stadiums);
    return;
  }

  Stadium.find({ _clientId: req.client._id }).exec(function (err, stadiums)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    }
    else
    {
      // Save stadiums to the memory cache.          
      LWStadiumInMemoryCache.put(cacheKey, stadiums, LWStadiumCacheTimeInMs);

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
  var cacheKey = req.stadium._id + ':' + levelName;

  // Do we already have this level in our memory cache?
  var level = LWStadiumInMemoryCache.get(cacheKey);
  if (level)
  {
    //console.log('ShowByLevel:level. level found in cache.');
    res.jsonp(level);
    return;
  }

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

        Level.findOne({ _id: levelId }).exec(function (err, level)
        {
          if (err)
          {
            res.render('error', {
              status: 404
            });
          }

          // Save this level by its _id to the memory cache.          
          LWStadiumInMemoryCache.put(cacheKey, level, LWStadiumCacheTimeInMs);

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