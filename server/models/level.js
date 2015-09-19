/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

var RowSchema = new Schema({
  _id: false,
  name: { type: String, trim: true },  // e.g. 100, 200, etc. 
  seats: [String]
});

var SectionSchema = new Schema({
  _id: false,
  name: { type: String, trim: true },  // e.g. 100, 200, etc. 
  rows: [RowSchema]
});

/**
 * Level Schema - Each level has a list of sections
 */
var LevelSchema = new Schema({
  _stadiumId: { type: Schema.ObjectId, ref: 'Stadium' },  // The Stadium associated with this Section.
  name: { type: String, trim: true },  // e.g. 100, 200, etc. 
  sections: [SectionSchema]
});

/**
 * Statics
 */
LevelSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
  },
  loadName: function (name, cb)
  {
    console.log('Level:name=' + name);
    this.findOne({
      name: name
    }).exec(cb);
  }
};

mongoose.model('Level', LevelSchema);
