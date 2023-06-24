const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: Number,
  room: Number,
  reserved: { type: Boolean, default: false },
  film: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Seat', seatSchema);