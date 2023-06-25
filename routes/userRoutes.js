const express = require("express");
const router = express.Router();
const User = require("../schemas/userSchema");
const Seat = require('../schemas/seatSchema');
const { v4: uuidv4 } = require("uuid");

router.post("/register", async (req, res) => {
  let emailExists = await User.findOne({ email: req.body.email });

  if (!emailExists) {
    let user = new User();
    user.username = req.body.username; 
    user.email = req.body.email;
    user.password = req.body.password; 
    user.userType = req.body.userType; 

    await user.save();  
    return res.status(200).json({ message: "Registration successful" });
  } else {
    return res
      .status(406)
      .json({ message: "Email already exists" });
  }
});
router.get('/reservations/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(403).json({ message: 'You are not logged in' });
  }

  const reservations = await Seat.find({ userId: userId })
    .populate('userId', 'username userType')
    .populate({
      path: 'room',
      populate: {
        path: 'film',
        model: 'Film'
      }
    });

  res.json({ reservations });
});


router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (req.body.password == user.password) {
    user.loginToken = uuidv4();
    console.log(user); 

    await user.save();

    res
      .cookie("loginToken", user.loginToken, { sameSite: "none", secure: true })
      .cookie("username", user.username, { sameSite: "none", secure: true })
      .cookie("userType", user.userType, { sameSite: "none", secure: true })
      .cookie("userId", user._id, { sameSite: "none", secure: true }) 
      .status(200)
      .json({
        message: "OK",
        cookies: {
          loginToken: user.loginToken,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        userType: user.userType, 
        userId: user._id, 
      });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});



module.exports = router;
