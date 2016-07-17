/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Show = mongoose.model('Show'),
    LogicalLayout = mongoose.model('LogicalLayout'),
    UserLocation = mongoose.model('User_Location'),
    ShowCommand = mongoose.model('ShowCommand'),
    _ = require('underscore');


/**
 * Find show by id
 */
exports.show = function (req, res, next, id)
{
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
  //console.log('Show:Create:show._eventId=' + show._eventId);

  UserLocation.find({ _eventId: show._eventId }, function (err, users)
  {
    //console.log('UL:Create:userLocations=' + users.length);
    if (err || !users || !users.length)
    {
      console.log('createShow:findULs:err=' + err);
      return res.status(400).jsonp(err);
    }
    
    var userCount = users.length;
    // console.log('UL:Create:userCount=' + userCount);

    var winningUL = null;
    var tries = 0;
    var randomNumber = 0;
    while (winningUL == null && tries < 2)
    {
      var randomNumber = Math.floor(Math.random() * userCount)
      winningUL = users[randomNumber];
      tries++;
    }

    if (winningUL == null)
    {
      winningUL = users[0];
    }
  
    LogicalLayout.find({ _eventId: show._eventId }, function (err, currentLayout)
    {
      if (err)
      {
        console.log('SHOW:Create:err=' + err);
        return res.send('shows/', {
          errors: err.errors,
          show: show
        });
      }

      //console.log('Show:Create:currentLayout=' + currentLayout[0].columns);
    
      show.winnerSections = winningUL.userSeat.section;
      show._winnerId = winningUL._id;
      show.winnerSeat = 'Row:' + winningUL.userSeat.row + '. Seat: ' + winningUL.userSeat.seat;

      var black = "0,0,0";
      var red = "216,19,37";
      var white = "162,157,176";

      // for each logical column, create commands
      // NOTE:this is simple logic. Need to account for logical rows and seats.  22
      var logicalCol = 1;
      var currentSection;
      var cmdList = [];
      var cmds = [];
      var onWinnerSection = false;
      var randomDelay;

      // TODO: remove the hardcoding of subtracting 6 seconds for the contest. If this was a litewave only, don't subtract.
      // See later TODO about putting command creation in a loop for more easily setting the # of commands.
      var columnLength = currentLayout[0].columns.length;
      var first_length = Math.ceil(((show.length - 6) * 1000) / columnLength);  //  first was 350 ms
      if (first_length < 350)
      {
        first_length = 350;
      }

      var second_length = 250;  // 250 ms
      var third_length = 250;  // 250 ms
      var fourth_length = 250;  // 250 ms
      var firstColLengthMS = columnLength * first_length;  // 11sec
      var secondColLengthMS = columnLength * second_length;  // 5.5sec

      while (logicalCol <= columnLength)
      {
        currentSection = currentLayout[0].columns[logicalCol - 1].sectionList;

        // If a contest is involved set winner.
        if (show.type >= 1)
        {
          // TODO Need to handle multiple winning sections with a loop.
          onWinnerSection = (currentSection.indexOf(show.winnerSections.toString()) > -1);
        }

        // If a LiteShow
        if (show.type === 0 || show.type === 1)
        {
          // Wave 1.
          if (logicalCol > 1) {
            // first section doesn't need to wait.
            cmdList.push({ "ct": "w", "cl": first_length * (logicalCol - 1) });
          }
          cmdList.push({ "bg": red, "cl": first_length, "sv": true });             // display 500 ms and vibrate
          cmdList.push({ "ct": "w", "cl": firstColLengthMS - (first_length * logicalCol) }); // pause 21.5 seconds, 21 sec, 20.5 sec

          // Wave 2.
          if (logicalCol > 1) {
            // first section doesn't need to wait.
            cmdList.push({ "ct": "w", "cl": second_length * (logicalCol - 1) });
          }
          cmdList.push({ "bg": red, "cl": second_length, "sv": true }); // display and vibrate.
          cmdList.push({ "ct": "w", "cl": secondColLengthMS - (second_length * logicalCol) }); // pause 21.750 seconds, 21.5. 21.25, 21
        }

        // If a contest.
        if (show.type >= 1)
        {
          // Common Contest Commands
          // Generate random delay time between 0 and 100 ms for each logical column.
          // NOTE: must be small to prevent winning phone to go off too soon.
          // TODO: put in a loop of X number so we easily know how many commands we are adding.
          randomDelay = Math.floor(Math.random() * 100);
          cmdList.push({ "ct": "w", "cl": randomDelay });  // wait X ms, max delay 250ms        
          cmdList.push({ "bg": black, "cl": first_length });
          cmdList.push({ "bg": white, "cl": first_length });
          cmdList.push({ "bg": red, "cl": first_length });
          cmdList.push({ "bg": black, "cl": first_length });
          cmdList.push({ "bg": white, "cl": first_length });
          cmdList.push({ "bg": red, "cl": first_length, "sv": true });

          cmdList.push({ "bg": black, "cl": second_length });
          cmdList.push({ "bg": white, "cl": second_length });

          // Take out a few commands from non-winner sections
          if (onWinnerSection) {
            cmdList.push({ "bg": red, "cl": second_length });
          }
          cmdList.push({ "bg": black, "cl": second_length });

          if (onWinnerSection) {
            cmdList.push({ "bg": white, "cl": second_length });
          }
          cmdList.push({ "bg": red, "cl": second_length, "sv": true });

          cmdList.push({ "bg": black, "cl": second_length });
          cmdList.push({ "bg": white, "cl": second_length });

          if (onWinnerSection) {
            cmdList.push({ "bg": red, "cl": second_length });
          }
          cmdList.push({ "bg": black, "cl": second_length });

          if (onWinnerSection) {
            cmdList.push({ "bg": white, "cl": second_length });
          }
          cmdList.push({ "bg": red, "cl": second_length });

          // Commands for winning section
          if (onWinnerSection) {
            cmdList.push({ "pif": "w", "bg": black, "cl": second_length });
            cmdList.push({ "bg": white, "cl": second_length });
            cmdList.push({ "pif": "w", "bg": red, "cl": second_length });
            cmdList.push({ "bg": black, "cl": second_length });
            cmdList.push({ "bg": white, "cl": second_length });
            cmdList.push({ "pif": "w", "bg": red, "cl": second_length, "sv": true });

            // push winning command to winner inside of winning section.
            cmdList.push({ "pif": "w", "ct": "win", "bg": red, "cl": second_length });
            cmdList.push({ "pif": "w", "bg": black, "cl": second_length, "sv": true });
            cmdList.push({ "pif": "w", "bg": white, "cl": second_length });
            cmdList.push({ "pif": "w", "bg": red, "cl": second_length, "sv": true });
            cmdList.push({ "pif": "w", "bg": black, "cl": second_length });
            cmdList.push({ "pif": "w", "bg": white, "cl": second_length });
          }
        }

        // Add this set of commands to the overall list
        cmds.push({ "id": logicalCol - 1, "commandList": cmdList.slice(0) });

        // clear out commands.
        cmdList = [];

        logicalCol++;
      }

      // Now create the show.
      show.save(function (err)
      {
        if (err)
        {
          console.log('SHOW:Create:err=' + err);
          return res.send('shows/', {
            errors: err.errors,
            show: show
          });
        }

        if (show._id)
        {
          var showCommands = new ShowCommand({
            _showId: show._id,
            commands: cmds,
            type: show.type
          });

          // Second, save the ShowCommands.
          showCommands.save(function (err, showCommand)
          {
            // console.log('SHOW:Create:showCommand._id' + showCommand._id);

            if (showCommand._id)
            {
              // Lastly, save the ShowCommandId on the Show.
              show._showCommandId = showCommand._id;
              show.update();

              // console.log('SHOW:Create:show._showCommandId' + show._showCommandId);

              // Finally return the show!
              res.jsonp(show);
            }
          });
        }
      }); // Show.save
    }); // LogicalLayout query
  }); // UL query
};

/**
 * Update a show
 */
exports.update = function (req, res)
{
  var show = req.show;
  show = _.extend(show, req.body);

  // Use the passed in startOffset to calculate the show start time based on server time.
  var curTime = new Date();
  var startTime = Math.floor(curTime.getTime() + (1000 * show.startShowOffset));
  var startTimeDate = new Date(startTime);
  show.startAt = startTimeDate;

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
