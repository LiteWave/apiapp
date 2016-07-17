/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * Show Schema - 
 */

var ShowSchema = new Schema({
  _eventId: { type: Schema.ObjectId, ref: 'Event' },
  _showCommandId: { type: Schema.ObjectId, ref: 'ShowCommand' },  // The id of the list of Show Commands
  _winnerId: { type: Schema.ObjectId, ref: 'User_Location' },  // set if this show is a contest.
  length: Number, // How long is the show?  In seconds.
  startShowOffset: Number,  // how many seconds from the current server time should the show start?
  startAt: Date,  // exact time to start show - normally set dynamically during the event since the start time might not be known ahead of time
  type: Number,   // type of show: liteshow, liteshow + contest, contest
  winnerSeat: String, // THe seat of the selected winner.
  winnerSections: [{ type: String, trim: true }], // list of winning sections. Could be a single section.
  winnerImageUrl: String,  // URL of image to display to winner.
  winnerUrl: String  // URL to go to if they are the winner.
});

/**
 * Statics
 */
ShowSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
    //}).populate('_eventId').populate('_showCommandId').exec(cb);
  },
  // looks for an eventLiteShow that has a startAt that is after now
  find_active: function (event_id, cb)
  {
    var utc = new Date().toISOString();

    //console.log('EJ:Create. Server utc ' + utc);

    this
    .findOne({ _eventId: event_id })
    .where('startAt').gt(utc)
    .exec(cb);
  }
};

/**
 * Methods
 */
ShowSchema.methods = {

  getUserCommands: function (user_location_id)
  {
    // return a LiteShow object that contains just the commands for this user's seat

  },
  setWinner: function (winner_id)
  {
    this._winnerId = winner_id;
    return 'ok';
  }
};
mongoose.model('Show', ShowSchema);

