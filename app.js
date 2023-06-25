const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const seatRoutes = require('./routes/seatRoutes');
const Seat = require('./schemas/seatSchema');
const userRoutes = require('./routes/userRoutes');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const mongodb_uri = 'mongodb+srv://Paulo:WebApp2023!@webapp.rilzm4v.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(
  mongodb_uri,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.set('strictQuery', false);

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

app.use(session({
  secret: 'my super secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'none'
  },
  store: MongoStore.create({
    mongoUrl: mongodb_uri,
    mongooseConnection: mongoose.connection
  })
}));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


async function createSeats() {
  const rooms = 10;
  const seatsPerRoom = 30;
  for (let i = 1; i <= rooms; i++) {
    const seatsInRoom = await Seat.countDocuments({ room: i });
    if (seatsInRoom < seatsPerRoom) {
      for (let j = seatsInRoom + 1; j <= seatsPerRoom; j++) {
        const seat = new Seat({ number: j, room: i });
        await seat.save();
      }
    }
  }
  console.log("Seats created");
}

createSeats();


app.use('/user', userRoutes);
app.use('/seat', seatRoutes);

app.get('/logout', (req, res) => {
  res.clearCookie('loginToken');
  res.clearCookie('username');
  res.clearCookie('userType');
  res.clearCookie('userId');
  res.json({ status: "Logged out" });
});


app.listen(port, async () => {
  console.log(`Running on port ${port}`);
});