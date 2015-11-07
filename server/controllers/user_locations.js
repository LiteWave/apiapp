/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Event = mongoose.model('Event'),
    LogicalLayout = mongoose.model('LogicalLayout'),
    UserLocation = mongoose.model('User_Location'),
    _ = require('underscore');


/**
 * Find user_location by id
 */
exports.user_location = function (req, res, next, id)
{
  UserLocation.load(id, function (err, user_location)
  {
    if (err) return next(err);
    //if (!user_location) return next(new Error('Failed to load user_location ' + id));
    if (!user_location)
    {
      return next(res.status(400).jsonp("Failed to load user_location" ));
      //return next(new Error('Failed to load user_location ' + id));
    }
    req.user_location = user_location;
    next();
  });
};

/**
 * 
 */
exports.create = function (req, res)
{
  console.log('UL:Create:event id=' + req.params.eventId + '. userKey:' + req.body.userKey);
  console.log('UL:Create:event req.body.userSeat.level=' + req.body.userSeat.level + '. req.body.userSeat.section:' + req.body.userSeat.section);
  console.log('UL:Create:event req.body.userSeat.row=' + req.body.userSeat.row + '. req.body.userSeat.seat:' + req.body.userSeat.seat);

  UserLocation.findOne({
    _eventId: req.params.eventId,
    "userSeat.level": req.body.userSeat.level, "userSeat.section" : req.body.userSeat.section, "userSeat.row" : req.body.userSeat.row, "userSeat.seat" : req.body.userSeat.seat
  }).exec(function (err, user_location)
  {
    //console.log("UL:" + user_location);
    if (err)
    {
      console.log('UL:Create:Some kind of error on finding UL: ' + err);
      return res.status(400).jsonp(err);
    }

    if (user_location != null)
    {
      // Check if this user is rejoining or someone is trying to take someone else's seat.
      console.log('UL:Create:UL NOT NULL: ');
      console.log('UL:Create:req.body.userKey: ' + req.body.userKey);
      console.log('UL:Create:user_location.userKey: ' + user_location.userKey);
      if (req.body.userKey.localeCompare(user_location.userKey) != 0)
      {
        // This seat is already taken. Return 400.
        console.log('UL:Create:This seat is already taken.');
        return res.status(400).jsonp(err);
      }

      // Found an existing user who is rejoining. Log a message that we are reusing the UL.
      console.log('UL:Create:Info: Reusing userLocation with userKey=' + req.body.userKey);

      user_location.delete;
      user_location = null;
    }
    else
    {
      // Brand new user joining.
      console.log('UL:Create:No UL. Creating new UL with ' + req.body.userKey);
    }

    LogicalLayout.findOne({ _eventId: req.params.eventId }).exec(function (err, layout)
    {
      if (err)
      {
        console.log('UL:Create:Some kind of error on finding Layout: ' + err);
        return res.status(400).jsonp(err);
      }

      var user_location = new UserLocation(req.body);
      user_location._eventId = req.params.eventId;

      if (!user_location.updateLogicalSeat(layout))
      {
        console.log('UL:Create:Error setting logical seat. Defaulting to 1 and 1.');
        this.logicalCol = 1;
        this.logicalRow = 1;
      }

      //  we are seeing if the time that the mobile app has is different than the server.  The problem is that the time to post
      //   to the server is different depending on the phone, so the time offset is actually varied enough due to this posting that
      //   it makes the show visibly inaccurate.   Assuming all cell phones have the same time, then really what we are trying to 
      //    accomplish here is to take into account phones that are in different time zones, so if the calculated offset is less than 1 
      //    second, we set the offset to 0.  If some day we have a better way to deal with these offsets, then we can do it here.
      var mobile_time_offset = 0;
      if (req.body.mobileTime)
      {
        var curTime = new Date();
        console.log('UL:Create. Server curTime initial:' + curTime);
        var curUTCTime = curTime.getTime() - (curTime.getTimezoneOffset() * 60000);  // convert to GMT time offset
        console.log('UL:Create. Server curUTCTime:' + curUTCTime);

        var mobile_date = new Date(req.body.mobileTime);
        var mobile_timezone_offset = mobile_date.getTimezoneOffset() * 60000;
        mobile_time_offset = curUTCTime - mobile_date.getTime() - mobile_timezone_offset;
        //mobile_time_offset = mobile_date.getTime() - curUTCTime;

        console.log('UL:Create. mobile_timezone_offset:' + mobile_timezone_offset);
        console.log('UL:Create. mobile_time_offset:' + mobile_time_offset);
        console.log('UL:Create. Mobile Time:' + mobile_date);

        user_location.mobileTimeOffset = mobile_time_offset;

        if (mobile_time_offset < 1)
        {
          mobile_time_offset = 0;
        }
      }

      user_location.save(function (err, UL)
      {
        if (err)
        {
          console.log('UL:Create:Error saving UL. err: ' + err);
          return res.status(400).jsonp(err);
        }
        else
        {
          res.jsonp(UL);
        }
      });
    });
  });
};

/**
 * Update a user_location
 */
exports.update = function (req, res)
{
  var user_location = req.user_location;
  user_location = _.extend(user_location, req.body);
  user_location.updateLogicalSeat();
  user_location.save(function (err)
  {
    res.jsonp(user_location);
  });
};


/**
 * Delete an user_location
 */
exports.destroy = function (req, res)
{
  var user_location = req.user_location;

  user_location.remove(function (err)
  {
    if (err)
    {
      res.render('Error deleting User Location', {
        status: 400
      });
    }
    else
    {
      res.jsonp(user_location);
    }
  });
};

/**
 * Show a user_location
 */
exports.show = function (req, res)
{
  res.jsonp(req.user_location);
};

/**
 * List of UserLocations for an Event 
 */
exports.all = function (req, res)
{
  UserLocation.find({ _eventId: req.params.eventId }).exec(function (err, user_locations)
  {
    console.log('Inside of Find');
    if (err)
    {
      res.render('Error getting User Locations', {
        status: 404
      });
    } else
    {
      console.log('no error results should be retured');
      res.json(user_locations);
    }
  });
};