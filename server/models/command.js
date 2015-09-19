/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * LiteShow Schema - 
 */

/*
 *  command schema
 *      if the location_type is col, then everyone in col=location_param1 plays this command at the appropriate time and length
 *              for row, everyone in the same row = param1
 *              for seat, the specified seat in param1=row, param2=col
 *              for all, all devices.
 */
var CommandSchema = new Schema({
  locT: String,  // location type:  col, row, seat, all, winner (specific winner's phone only) (not used by mobile app)
  lp1: Number,    // location parameter 1  (not used by mobile app)
  lp2: Number,   // only used if it's a seat and this is the column  (not used by mobile app)
  offset: Number,  // milliseconds from start of show to do this command (not returned to mobile app, only used for full command set)
  cif: String, // command if winner ('w') or loser 'l'.  if this is set and its a contest then only play the command if you're a loser or winner
  ct: String, // command type, default is 'c' for color if not specified.   could be:  wait (w), flash (f), color (c), sound (s), winning command (win)
  sv: Boolean,  // should vibrate? default is false.   true if vibrate during this sequence
  lt: String, // default is 't' if not specified.  length type: t (time:  play_length1 milliseconds), r (random color between pl1 and pl2 times)
  //  NOTE: if the length type is 'r' for random, then the app will wait after it stops playing the color until pl2 time
  cl: Number,  // command length in milliseconds
  s: String,      // name of the sound to play - for future use
  bg: String,   // color:  rgb value (255,0,0 for red)
  b: Number  // brightness 1 - 10 - for future use
});

/**
 * Statics
 */
CommandSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

/**
 * Methods
 */
CommandSchema.methods = {};

mongoose.model('Command', CommandSchema);

