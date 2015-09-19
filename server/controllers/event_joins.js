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
    console.log('in event_join constr');
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
  var curTime = new Date();
  console.log('EJ:Create. Server curTime initial:' + curTime);
  var curUTCTime = curTime.getTime() - (curTime.getTimezoneOffset() * 60000);  // convert to GMT time offset

  //  we are seeing if the time that the mobile app has is different than the server.  The problem is that the time to post
  //   to the server is different depending on the phone, so the time offset is actually varied enough due to this posting that
  //   it makes the show visibly inaccurate.   Assuming all cell phones have the same time, then really what we are trying to 
  //    accomplish here is to take into account phones that are in different time zones, so if the calculated offset is less than 1 
  //    second, we set the offset to 0.  If some day we have a better way to deal with these offsets, then we can do it here.
  //
  //    $$$ test this
  var mobile_time_offset = 0;
  if (req.body.mobileTime)
  {
    var mobile_date = new Date(req.body.mobileTime);
    var mobile_timezone_offset = mobile_date.getTimezoneOffset() * 60000;
    mobile_time_offset = mobile_date.getTime() - mobile_timezone_offset - curUTCTime;

    console.log('EJ:Create. mobile_time_offset:' + (mobile_time_offset / 60000));
    console.log('EJ:Create. Mobile Time:' + mobile_date);

    if (mobile_time_offset < 10)
    {
      mobile_time_offset = 0;
    }
  }

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
        console.log('error, event liteshow is null');
        console.log(err);
        res.status(404);
        res.send({ error: 'show not available' });
        return;
      }
      else
      {
        console.log('EJ. show:startAt:' + show.startAt);

        console.log('EJ:trying to create the EJ');

        UserLocation.findOne({ _eventId: req.user_location._eventId, _id: requestUserLocationId }, function (err, UL)
        {
          var event_join = new EventJoin(req.body);
          event_join.mobileTimeOffset = mobile_time_offset;
          event_join._user_location_Id = req.user_location._id;
          event_join._showId = show._id;

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

            //console.log('EJ:Create:Commands:showCommand:showCommand[0].commands[0]');
            //console.log('EJ:Create:' + showCommand.commands[0].commandList);

            // retrieve the commands for this user based on their logical row or col. Only col for now.
            event_join.commands = logicalCmd.commandList;
            event_join._winnerId = show._winnerId;

            console.log('EJ:Create::event_join._winnerId=' + event_join._winnerId);

            // use the offset to set the time for this phone to start
            event_join.mobileStartAt = new Date(Math.round(show.startAt.getTime() - event_join.mobileTimeOffset));

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
