/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../config/config'),
    Schema = mongoose.Schema;

/**
 * UserLocation Schema - a location is a seat/location at an event at a stadium
 */
var UserLocationSchema = new Schema({
  _eventId: { type: Schema.ObjectId, ref: 'Event' },
  userKey: String,
  userSeat: {
    level: String,
    section: String,
    row: String,
    seat: String
  },
  logicalRow: Number,
  logicalCol: Number,
  mobileTimeOffset: Number,  // the difference in ms between the passed in mobile time and the server time (used for info only)
});

/**
 * Statics
 */
UserLocationSchema.statics = {
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
UserLocationSchema.methods = {
  /**
   * set a logical seat
   */
  updateLogicalSeat: function (layout)
  {
    if (layout == null || !layout.columns || !layout.columns.length)
    {
      return -1;
    }

    // Look up this user's logical column and row.
    // Can I do this with a search?
    var colLength = layout.columns.length;
    var sectionLength = 0;
    var section = 0;
    var col = 0;
    for (col = 0; col < colLength; col++)
    {
      sectionLength = layout.columns[col].sectionList.length;
      for (section = 0; section < sectionLength; section++)
      {
        if (layout.columns[col].sectionList[section] === this.userSeat.section)
        {
          this.logicalCol = col;
          this.logicalRow = 1;
          col = colLength + 1;
          break;
        }
      }
    }

    // first loop through sections from stadium.sections[i].name == this.userSeat.section
    //  then loop through rows, find row:  sections.rows[x].name == this.userSeat.row
    //   then find seat:  row.seats[i].name == this.seat.seatNumber
    //  now this.logicalCol = seat.virtual_col
    return 'ok';
  }
};

mongoose.model('User_Location', UserLocationSchema);