/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * Client Schema - 
 */
var ClientSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  settings: {
    backgroundColor: { type: String, trim: true },
    borderColor: { type: String, trim: true },
    logoUrl: String,
    highlightColor: { type: String, trim: true },
    retryCount: Number,
    textColor: { type: String, trim: true },
    textSelectedColor: { type: String, trim: true }
  }, // settings for Client.
});


/**
 * Validations
 */
ClientSchema.path('name').validate(function (name)
{
  return name.length;
}, 'Name cannot be blank');


/**
 * Statics
 */
ClientSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
  }
};

mongoose.model('Client', ClientSchema);