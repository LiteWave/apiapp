/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    ShowCommand = mongoose.model('ShowCommand'),
    _ = require('underscore');


/**
 * Find ShowCommand by id
 */
exports.showcommand = function (req, res, next, id)
{
  console.log('ShowCommands:showcommand:id=' + id);
  ShowCommand.load(id, function (err, sc)
  {
    console.log('ShowCommands:showcommand:err=' + err);
    if (err) return next(err);
    if (!sc) return next(new Error('Failed to load show ' + id));
    console.log('ShowCommands:showcommand::' + sc);
    req.showcommand = sc;
    next();
  });
};

/**
 * Show a ShowCommand
 */
exports.show = function (req, res)
{
  console.log('ShowCommands:show::');
  res.jsonp(req.showcommand);
};

/**
 * 
 */
exports.create = function (req, res)
{
  var showCommand = new ShowCommand(req.body);
  showCommand._showId = req.params.showId;
  console.log('ShowCommand:Create:clientId=' + showCommand._showId);

  showCommand.save(function (err)
  {
    if (err)
    {
      return res.send('shows/', {
        errors: err.errors,
        showCommand: showCommand
      });
    } else
    {
      res.jsonp(showCommand);
    }
  });
};

/**
 * Update a showCommand
 */
exports.update = function (req, res)
{
  console.log('ShowCommand:Update:req=' + req);
  var showCommand = req.showCommand;
  showCommand = _.extend(showCommand, req.body);
  showCommand.save(function (err)
  {
    res.jsonp(showCommand);
  });
};


/**
 * Delete a showCommand
 */
exports.destroy = function (req, res)
{
  var showCommand = req.showCommand;
  showCommand.remove(function (err)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(showCommand);
    }
  });
};

/**
 * List of ShowCommands for a Show
 */
exports.all = function (req, res)
{
  console.log('ShowCommands:all');
  //ShowCommand.find({ _showCommandId: req.showCommandId._id }).exec(function (err, showCommands)
  ShowCommand.find().exec(function (err, showCommands)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(showCommands);
    }
  });
};
