/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Show = mongoose.model('Show'),
    EventJoin = mongoose.model('Event_Join'),
    UserLocation = mongoose.model('User_Location'),
    ShowCommand = mongoose.model('ShowCommand'),
    _ = require('underscore');

/**
 * Find event_join by id
 */
exports.event_join = function (req, res, next, id)
{
  EventJoin.load(id, function (err, event_join)
  {
    // don't know this was doing.
    //EventJoin.findOne({ _id: req.params.event_joinId }).populate('_user_location_Id').exec(function (err, event_joint) {
    //console.log(err);
    if (err) return next(err);
    if (!event_join) return next(new Error('Failed to load event_join ' + id));
    req.event_join = event_join;
    next();
  });
};

/**
 * 
 */
exports.create = function (req, res)
{
  var requestUserLocationId = req.user_location._id;

  // I'm thinking that if they already joined, then we delete the first join and create the new one.  That will help me out
  //  in testing, too, because we'll be deleting old data that we're not using any more.

  // ???? need to check to see if the user already joined this event and if they did, then return an error.
  // $$$ instead of an error just return the EJ for this user?
  //EventJoin.find({_user_location_Id: requestUserLocationId}, function(err, event_joins) {
  //  if (err || event_joins.count > 0) {
  //    res.render('error', {
  //      status: 404
  //    });
  //  }
  // });

  // see if there's an active show object before going any further
  Show.find_active(req.user_location._eventId, function (err, show)
  {
    if (err)
    {
      res.render('No active show error', {
        status: 404
      });
    }
    else
    {      
      if (!show)
      {
        console.log(err);
        res.status(404);
        res.send({ error: 'show not available' });
        return;
      }
      else
      {
        UserLocation.findOne({ _eventId: req.user_location._eventId, _id: requestUserLocationId }, function (err, UL)
        {
          if (err)
          {
            console.log('Err in find UL to set Winner. err=' + err);
            res.status(404);
            res.send({ error: 'show not available' });
            return;
          }

          if (!UL)
          {
            console.log('No UL.');
            res.status(404);
            res.send({ error: 'show not available' });
            return;
          }

          var event_join = new EventJoin(req.body);
          event_join.mobileTimeOffset = !!(UL.mobileTimeOffset) ? UL.mobileTimeOffset : 0;
          event_join._user_location_Id = req.user_location._id;
          event_join._showId = show._id;
          event_join._winnerId = null;

          // Pick a winner if we don't have one.
          if (!show._winnerId)
          {
            // TODO handle multiple sections.

            // Set the first person to join as the winner.
            event_join._winnerId = UL._id;

            // Save the show so we don't keep picking a winner.
            var seat = 'Section: ' + UL.userSeat.section + '. Row: ' + UL.userSeat.row + '. Seat: ' + UL.userSeat.seat;
            Show.update({ _id: show._id }, { $set: { _winnerId: UL._id, winnerSections: UL.userSeat.section, winnerSeat: seat } }, function (err, show2)
            {
              ShowCommand.findOne({ _id: show._showCommandId }, function (err, showCommand)
              {
                if (err)
                {
                  console.log('Err in find SC. err=' + err);
                  res.status(400);
                  res.send({ error: 'Show Command not available' });
                  return;
                }

                if (!showCommand)
                {
                  console.log('Show Command not available.');
                  res.status(404);
                  res.send({ error: 'Show Command not available' });
                  return;
                }

                var logicalCmd = showCommand.commands[UL.logicalCol];
                if (!logicalCmd || !logicalCmd.commandList)
                {
                  console.log('Commands for this logical column are not available.');
                  res.status(404);
                  res.send({ error: 'Commands for this logical column are not available' });
                  return;
                }

                // retrieve the commands for this user based on their logical row or col. Only col for now.
                event_join.commands = logicalCmd.commandList;

                // use the offset to set the time for this phone to start
                event_join.mobileStartAt = new Date(Math.round(show.startAt.getTime() + event_join.mobileTimeOffset));

                event_join.save(function (err)
                {
                  if (err)
                  {
                    res.render('error', {
                      status: 400
                    });
                  } else
                  {
                    res.jsonp(event_join);
                  }
                });
              }); // end ShowCommand
            }); // end Show
          }
          else
          {
            ShowCommand.findOne({ _id: show._showCommandId }, function (err, showCommand)
            {
              if (err)
              {
                console.log('Err in find SC. err=' + err);
                res.status(400);
                res.send({ error: 'Show Command not available' });
                return;
              }

              if (!showCommand)
              {
                console.log('Show Command not available.');
                res.status(404);
                res.send({ error: 'Show Command not available' });
                return;
              }

              var logicalCmd = showCommand.commands[UL.logicalCol];
              if (!logicalCmd || !logicalCmd.commandList)
              {
                console.log('Commands for this logical column are not available.');
                res.status(404);
                res.send({ error: 'Commands for this logical column are not available' });
                return;
              }

              // retrieve the commands for this user based on their logical row or col. Only col for now.
              event_join.commands = logicalCmd.commandList;

              // use the offset to set the time for this phone to start
              event_join.mobileStartAt = new Date(Math.round(show.startAt.getTime() + event_join.mobileTimeOffset));

              event_join.save(function (err)
              {
                if (err)
                {
                  res.render('error', {
                    status: 400
                  });
                } else
                {
                  res.jsonp(event_join);
                }
              });
            }); // end ShowCommand
          }
        }); // end UL
      } // end else
    } // end else
  });  // end call back function for find_active
};

/**
 * Update a event_join
 */
exports.update = function (req, res)
{
  var event_join = req.event_join;
  event_join = _.extend(event_join, req.body);
  event_join.save(function (err)
  {
    res.jsonp(event_join);
  });
};


/**
 * Delete an event_join
 */
exports.destroy = function (req, res)
{
  var event_join = req.event_join;

  event_join.remove(function (err)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(event_join);
    }
  });
};

/**
 * Show a event_join
 */
exports.show = function (req, res)
{
  res.jsonp(req.event_join);
};

/**
 * List of EventJoins for an show - should be thousands
 */
exports.all = function (req, res)
{
  EventJoin.find({ _eventId: req.params.eventId })
  .sort('logicalCol')
  .populate('_user_location_Id')
  .exec(function (err, event_joins)
  {
    if (err)
    {
      res.render('error', {
        status: 400
      });
    } else
    {
      res.jsonp(event_joins);
    }
  });
};
