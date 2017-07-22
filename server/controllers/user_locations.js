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
  var layoutId = null;
  UserLocation.findOne({
    _eventId: req.params.eventId,
    "userSeat.section" : req.body.userSeat.section
    //"userSeat.level": req.body.userSeat.level, "userSeat.section" : req.body.userSeat.section, "userSeat.row" : req.body.userSeat.row, "userSeat.seat" : req.body.userSeat.seat
  }).exec(function (err, user_location)
  {
    if (err)
    {
      console.log('UL:Create:Some kind of error on finding UL: ' + err);
      return res.status(400).jsonp(err);
    }

    if (user_location != null)
    {
      console.log('UL:Create:Info: Found a user already in this section.');

      // Check if this user is rejoining or someone is trying to take someone else's seat.
      /*if (req.body.userKey.localeCompare(user_location.userKey) != 0)
      {
        // This seat is already taken. Return 400.
        console.log('UL:Create:This seat is already taken.');
        return res.status(400).jsonp(err);
      }*/

      // Found an existing user who is rejoining. Log a message that we are reusing the UL.
      //console.log('UL:Create:Info: Reusing userLocation with userKey=' + req.body.userKey);

      //user_location.delete;
      //user_location = null;
    }
    else
    {
      // Brand new user joining.
      console.log('UL:Create:Info: New user to this section.');
      //console.log('UL:Create:No UL. Creating new UL with ' + req.body.userKey);
    }

    // Look up the Layout by loading this Event. This is to keep the Event Id Separate from the Layout.
    Event.findOne({ _id: req.params.eventId }).exec(function (err, event)
    {
      if (err)
      {
        console.log('UL:Create:Some kind of error on finding Event: ' + err);
        return res.status(400).jsonp(err);
      }

      layoutId = event._logicalLayoutId;
      console.log('UL:event._logicalLayoutId: ' + event._logicalLayoutId);

      LogicalLayout.findOne({ _id: layoutId }).exec(function (err, layout)
      {
        if (err)
        {
          console.log('UL:Create:Some kind of error on finding Layout: ' + err);
          return res.status(400).jsonp(err);
        }

        var userLocation = new UserLocation(req.body);
        userLocation._eventId = req.params.eventId;

        // V2 - ignore input row and seat and generate a random string (# of ms since 1970, Date.now() requires > IE9
        if (!userLocation.userSeat.seat)
        {
          userLocation.userSeat.seat = Date.now().toString();
        }

        console.log('UL:userLocation._eventId: ' + userLocation._eventId);
        console.log('UL:layout: ' + layout);
        console.log('userLocation.userSeat.seat: ' + userLocation.userSeat.seat);

        if (!userLocation.updateLogicalSeat(layout))
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
          var curUTCTime = curTime.getTime() - (curTime.getTimezoneOffset() * 60000);  // convert to GMT time offset

          var mobile_date = new Date(req.body.mobileTime);
          var mobile_timezone_offset = mobile_date.getTimezoneOffset() * 60000;
          mobile_time_offset = mobile_date.getTime() - mobile_timezone_offset - curUTCTime;
          userLocation.mobileTimeOffset = mobile_time_offset;
        }

        userLocation.save(function (err, UL)
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
    if (err)
    {
      res.render('Error getting User Locations', {
        status: 404
      });
    } else
    {
      res.json(user_locations);
    }
  });
};

/**
 * Count of UserLocations for an Event 
 */
exports.count = function (req, res)
{
  UserLocation.count({ _eventId: req.params.eventId }).exec(function (err, count)
  {
    if (err)
    {
      res.render('Error getting count User Locations', {
        status: 404
      });
    } else
    {
      res.json([{ "usercount": count }]);
    }
  });
};

/**
 * Pick a random winningSection from the list of UserLocations for an Event 
 */
exports.pickwinningsection = function (req, res)
{
  UserLocation.find({ _eventId: req.params.eventId }).exec(function (err, user_locations)
  {
    var userCount = user_locations.length;
    var randomPerson = user_locations[Math.floor(Math.random() * userCount)];
    if (!randomPerson)
    {
      randomPerson = user_locations[0];
    }

    var winningSection = randomPerson.userSeat.section;

    if (err)
    {
      res.render('Error getting winningSection', {
        status: 404
      });
    }
    else
    {
      res.json([{ "winningsections": winningSection }]);
    }
  });
};