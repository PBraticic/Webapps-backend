const express = require('express');
const router = express.Router();
const Seat = require('../schemas/seatSchema');
const User = require('../schemas/userSchema');

router.post('/reserve/:seatId', async (req, res) => {
  const seatId = req.params.seatId;
  const userId = req.body.userId;

  if (!userId) {
    return res.status(403).json({ message: 'You are not logged in' });
  }

  const seat = await Seat.findById(seatId);
  if (!seat) {
    return res.status(404).json({ message: 'Seat not found' });
  }

  if (seat.reserved) {
    return res.status(409).json({ message: 'Seat is already reserved' });
  }

  seat.reserved = true;
  seat.userId = userId;
  await seat.save();

  res.json({ message: 'Seat reserved successfully' });
});

router.post('/unreserve/:seatId', async (req, res) => {
  const seatId = req.params.seatId;
  const userId = req.body.userId;

  if (!userId) {
    return res.status(403).json({ message: 'You are not logged in' });
  }

  const seat = await Seat.findById(seatId);
  if (!seat) {
    return res.status(404).json({ message: 'Seat not found' });
  }

  if (!seat.reserved || seat.userId.toString() !== userId) {
    return res.status(409).json({ message: 'Seat is either not reserved or not reserved by you' });
  }

  seat.reserved = false;
  seat.userId = null;
  await seat.save();

  res.json({ message: 'Seat unreserved successfully' });
});
router.post('/unreserveByEmployee/:seatId', async (req, res) => {
  const seatId = req.params.seatId;
  const user = await User.findById(req.body.userId);

  if (!user || user.userType !== 'employee') {
    return res.status(403).json({ message: 'Only employees can remove reservations' });
  }

  const seat = await Seat.findById(seatId);
  if (!seat) {
    return res.status(404).json({ message: 'Seat not found' });
  }

  if (!seat.reserved) {
    return res.status(409).json({ message: 'Seat is not reserved' });
  }

  seat.reserved = false;
  seat.userId = null;
  await seat.save();

  res.json({ message: 'Seat unreserved successfully' });
});


router.get('/:room', async (req, res) => {
  const room = req.params.room;
  const seats = await Seat.find({ room: room }).populate('userId', 'username userType');

  const film = seats[0] ? seats[0].film : '';
  const dateTime = seats[0] ? seats[0].dateTime : '';
  res.json({ seats, film, dateTime });
});


router.post('/:room/setFilm', async (req, res) => {
  const room = req.params.room;
  const film = req.body.film;
  await Seat.updateMany({ room: room }, { film: film });
  res.json({ message: 'Film set successfully' });
});

router.post('/:room/setDateTime', async (req, res) => {
  const room = req.params.room;
  const dateTime = req.body.dateTime;
  await Seat.updateMany({ room: room }, { dateTime: dateTime });
  res.json({ message: 'Date/time set successfully' });
});



module.exports = router;
