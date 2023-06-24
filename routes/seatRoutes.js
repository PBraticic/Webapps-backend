const express = require('express');
const router = express.Router();
const Seat = require('../schemas/seatSchema');
const User = require('../schemas/userSchema'); // Import User schema

router.get('/', async (req, res) => {
  const seats = await Seat.find().populate('userId', 'username userType'); // Include 'userType' when populating 'userId'
  res.json({ seats });
});


router.post('/reserve/:seatId', async (req, res) => {
  const seatId = req.params.seatId;
  const userId = req.body.userId; // Get userId from the request body

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
  const userId = req.body.userId; // Get userId from the request body

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


router.get('/:room', async (req, res) => {
  const room = req.params.room;
  const seats = await Seat.find({ room: room }).populate('userId', 'username userType'); 
  // Extract the film name from the first seat as all seats in the same room should have the same film.
  const film = seats[0] ? seats[0].film : '';
  res.json({ seats, film });
});

router.post('/:room/setFilm', async (req, res) => {
  const room = req.params.room;
  const film = req.body.film;
  await Seat.updateMany({ room: room }, { film: film });
  res.json({ message: 'Film set successfully' });
});


module.exports = router;
