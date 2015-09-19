/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * ShowCommand Schema - List of commands for a show
 */

var ShowCommandSchema = new Schema({
  _showId: { type: Schema.ObjectId, ref: 'Show' },
  commands: [{   // the length of this equals the number of logical columns
    id: Number, // logical column id
    commandList: [mongoose.CommandSchema],  // array of commands for this logical column.
  }],
  type: Number   // type of show: liteshow, liteshow + contest, contest	
});

/**
 * Statics
 */
ShowCommandSchema.statics = {
  load: function (id, cb)
  {
    this.findOne({
      _id: id
    }).exec(cb);
    //}).populate('_showId').exec(cb);
  }
};

/**
 * Methods
 */
ShowCommandSchema.methods = {};

mongoose.model('ShowCommand', ShowCommandSchema);

