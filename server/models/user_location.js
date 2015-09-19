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
  logicalCol: Number
});

/**
 * Statics
 */
UserLocationSchema.statics = {
  load: function (id, cb)
  {
    console.log('UL:LOAD:id' + id);
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
    if (!layout.columns || !layout.columns.length)
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
      console.log('layout.columns[col].sectionList: ' + layout.columns[col].sectionList);
      sectionLength = layout.columns[col].sectionList.length;
      for (section = 0; section < sectionLength; section++)
      {
        // console.log('layout.columns[col].sectionList[sectionLength]: ' + layout.columns[col].sectionList[section]);
        if (layout.columns[col].sectionList[section] === this.userSeat.section)
        {
          console.log('FOUND. Logical column will be: ' + col);
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