/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Client = mongoose.model('Client'),
    _ = require('underscore');


/**
 * Find client by id
 */
exports.client = function (req, res, next, id)
{
  Client.load(id, function (err, client)
  {
    if (err) return next(err);
    if (!client) return next(new Error('Failed to load client ' + id));
    req.client = client;
    next();
  });
};

/**
 * Create a client
 */
exports.create = function (req, res)
{
  var client = new Client(req.body);

  client.save(function (err)
  {
    if (err)
    {
      return res.send('clients/', {
        errors: err.errors,
        client: client
      });
    } else
    {
      res.jsonp(client);
    }
  });
};

/**
 * Update a client
 */
exports.update = function (req, res)
{
  var client = req.client;

  client = _.extend(client, req.body);

  client.save(function (err)
  {
    res.jsonp(client);
  });
};

/**
 * Delete an client
 */
exports.destroy = function (req, res)
{
  var client = req.client;

  client.remove(function (err)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(client);
    }
  });
};

/**
 * Show a client
 */
exports.show = function (req, res)
{
  res.jsonp(req.client);
};

/**
 * List of Clients
 */
exports.all = function (req, res)
{
  Client.find().sort('name').exec(function (err, clients)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(clients);
    }
  });
};