/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * Event Schema - an event is at a specific stadium
 */
var EventSchema = new Schema({
  _clientId: { type: Schema.ObjectId, ref: 'Client' },
  _logicalLayoutId: { type: Schema.ObjectId, ref: 'LogicalLayout' },     // what is the logical grouping of sections and rows for this event? Based on Stadium's actual sections, rows, and seat numbers.
  _stadiumId: { type: Schema.ObjectId, ref: 'Stadium' },
  date: Date,
  name: { type: String, default: '', trim: true },
  settings: {
    backgroundColor: { type: String, trim: true },
    borderColor: { type: String, trim: true },
    logoUrl: String,
    highlightColor: { type: String, trim: true },
    retryCount: Number,
    textColor: { type: String, trim: true },
    textSelectedColor: { type: String, trim: true }
  }, // settings for Client.
  type: Number  // (future) The type of this event: sporting event (use whole Stadium), concert (half of Stadium), etc.
});

/**
 * Statics
 */
EventSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

mongoose.model('Event', EventSchema);