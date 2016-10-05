/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Event = mongoose.model('Event'),
    _ = require('underscore');

    // Declare global var.
    LWEventsInMemoryCache = require('memory-cache');
    LWEventsCacheTimeInMs = 60000;

/**
 * Find event by id
 */
exports.event = function (req, res, next, id)
{
  Event.load(id, function (err, event)
  {
    if (err) return next(err);
    if (!event) return next(new Error('Failed to load event ' + id));
    req.event = event;
    next();
  });
};

/*
* Create an event
*/
exports.create = function (req, res)
{
  var clientId = req.params.clientId;
  var event = new Event(req.body);
  event._clientId = clientId;

  event.save(function (err)
  {
    if (err)
    {
      return res.send('clients/', {
        errors: err.errors,
        client: client
      });
    } else
    {
      res.jsonp(event);
    }
  });
};

/**
 * Update a show
 */
exports.update = function (req, res)
{
  var event = req.event;
  event = _.extend(event, req.body);
  event.save(function (err)
  {
    res.jsonp(event);
  });
};

/**
 * Delete an evemt
 */
exports.destroy = function (req, res)
{
  var event = req.event;

  event.remove(function (err)
  {
    if (err)
    {
      res.render('Error deleting Event', {
        status: 400
      });
    } else
    {
      res.jsonp(event);
    }
  });
};

/**
 * Show an event
 */
exports.show = function (req, res)
{
  res.jsonp(req.event);
};

/**
 * List of Events for a client
 */
exports.all = function (req, res)
{
  var cacheKey = req.client._id;

  // Do we already have events in our memory cache?
  var events = LWEventsInMemoryCache.get(cacheKey);
  if (events)
  {
    //console.log('Events:all. events found in cache.');
    res.jsonp(events);
    return;
  }

  Event.find({ _clientId: req.client._id }).sort('-date').limit(10).exec(function (err, events)
  {
    if (err)
    {
      res.render('Could not find events', {
        status: 404
      });
    }
    else
    {
      // Save events to the memory cache.
      LWEventsInMemoryCache.put(cacheKey, events, LWEventsCacheTimeInMs);

      res.jsonp(events);
    }
  });
};