/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Event = mongoose.model('Event'),
    _ = require('underscore');

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
  console.log('Event:Create:clientId=' + clientId);
  var event = new Event(req.body);
  event._clientId = clientId;
  console.log('Event:Create:Event=' + event);
  console.log('Event:Create:clientId=' + event._clientId);

  event.save(function (err)
  {
console.log('Event:Create:err:' + err);
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
  console.log('EVENT:Update:req=' + req);
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
  Event.find({ _clientId: req.client._id }).exec(function (err, events)
  {
    if (err)
    {
      res.render('Could not find events', {
        status: 404
      });
    } else
    {
      res.jsonp(events);
    }
  });
};