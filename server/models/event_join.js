/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * EventJoin Schema - 
 */

var EventJoinSchema = new Schema({
  _showId: { type: Schema.ObjectId, ref: 'Show' },   // id of the actual event_liteshow that is currently active
  _user_location_Id: { type: Schema.ObjectId, ref: 'User_Location' },   // the user who just joined the event
  _winnerId: { type: Schema.ObjectId, ref: 'User_Location' },  // set to id of the winner. if null, then the receiver is not the winner
  //  the actual winner will also be stored in the event_liteshow object
  commands: [mongoose.CommandSchema],  // list of commands for this user.
  mobileTime: Date,   // passed in during creation to use as an offset from the actual Show's time  
  mobileTimeOffset: Number,  // the difference in ms between the passed in mobile time and the server time (used for info only)
  mobileStartAt: Date // time that the mobile app should start the show - might be slightly different than the event_lite show's start time  
});

/**
 * Statics
 */
EventJoinSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

mongoose.model('Event_Join', EventJoinSchema);

