/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

var LevelSchema = new Schema({
  _levelId: { type: Schema.ObjectId, ref: 'Level' },  // The Level.
  name: { type: String, trim: true },  // e.g. 100, 200, etc. 
});

/**
 * Stadium Schema - 
 */
var StadiumSchema = new Schema({
  _clientId: { type: Schema.ObjectId, ref: 'Client' },  // The client associated with this Stadium.
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  levels: [LevelSchema] // Array of id's that point to the each Level's data.
});


/**
 * Statics
 */
StadiumSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

mongoose.model('Stadium', StadiumSchema);
