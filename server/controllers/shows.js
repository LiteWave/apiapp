/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Show = mongoose.model('Show'),
    _ = require('underscore');


/**
 * Find show by id
 */
exports.show = function (req, res, next, id)
{
  //console.log('SHOW:Show:id=' + id);
  Show.load(id, function (err, show)
  {
    if (err) return next(err);
    if (!show) return next(new Error('Failed to load show ' + id));
    req.show = show;
    next();
  });
};

/**
 * 
 */
exports.create = function (req, res)
{
  var show = new Show(req.body);
  show._eventId = req.params.eventId;
  //console.log('SHOW:Create:clientId=' + show._eventId);
  //console.log('SHOW:Create:req.body=' + req.body);
  show.save(function (err)
  {
    if (err)
    {
      console.log('SHOW:Create:err=' + err);
      return res.send('shows/', {
        errors: err.errors,
        show: show
      });
    } else
    {
      res.jsonp(show);
    }
  });
};

/**
 * Update a show
 */
exports.update = function (req, res)
{
  //console.log('SHOW:Update:req=' + req);
  var show = req.show;
  show = _.extend(show, req.body);

  if (show.startShowOffset === 0)
  {
    // Use the passed in startOffset to calculate the show start time based on server time.
    var curTime = new Date();
    var startTime = Math.floor(curTime.getTime() + (1000 * show.startShowOffset));
    var startTimeDate = new Date(startTime);
    show.startAt = startTimeDate;
  }

  // Save the show
  show.save(function (err)
  {
    res.jsonp(show);
  });
};


/**
 * Delete an show
 */
exports.destroy = function (req, res)
{
  var show = req.show;

  show.remove(function (err)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(show);
    }
  });
};

/**
 * Show a specific show
 */
exports.getshow = function (req, res)
{
  //console.log('SHOW:GetShow:req.params.showId=');
  res.jsonp(req.show);
};

/**
 * List of Shows for an Event 
 */
exports.all = function (req, res)
{
  //Show.find({ _eventId: req.event._id, startAt: { $ne: null } }).exec(function (err, shows)
  Show.find({ _eventId: req.event._id }).exec(function (err, shows)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(shows);
    }
  });
};
