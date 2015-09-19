/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * Logical Layout Schema - a logical layout of sections and rows for an event at a specific stadium.
 */
var LogicalLayoutSchema = new Schema({
  _eventId: { type: Schema.ObjectId, ref: 'Event' },
  columns: [{   // the length of this equals the number of logical columns
    _id: false,
    id: Number, // logical column id
    sectionList: [{ type: String, trim: true }],  // array of sections that make up this logical column.
  }],
  rows: [{      // the length of this equals the number of logical rows
    _id: false,
    id: Number, // logical row id
    sectionList: { type: String, trim: true },  // array of sections that make up this logical row.
  }],
  name: { type: String, default: '', trim: true }
});

/**
 * Statics
 */
LogicalLayoutSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

mongoose.model('LogicalLayout', LogicalLayoutSchema);