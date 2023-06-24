const express = require("express");
const router = express.Router();
const User = require("../schemas/userSchema");
const { v4: uuidv4 } = require("uuid");

router.post("/register", async (req, res) => {
  let emailExists = await User.findOne({ email: req.body.email });

  if (!emailExists) {
    let user = new User();
    user.username = req.body.username;  // Added this line
    user.email = req.body.email;
    user.password = req.body.password; // ayou should hash this
    user.userType = req.body.userType; // Changed from isStaff to userType

    await user.save();  
    return res.status(200).json({ message: "Registration successful" });
  } else {
    return res
      .status(406)
      .json({ message: "Email already exists" });
  }
});

router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (req.body.password == user.password) {
    user.loginToken = uuidv4();
    console.log(user); // Add this line

    await user.save();

    res
      .cookie("loginToken", user.loginToken, { sameSite: "none", secure: true })
      .cookie("username", user.username, { sameSite: "none", secure: true })
      .cookie("userType", user.userType, { sameSite: "none", secure: true })
      .cookie("userId", user._id, { sameSite: "none", secure: true }) // Add this line
      .status(200)
      .json({
        message: "OK",
        cookies: {
          loginToken: user.loginToken,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        userType: user.userType, // add this line
        userId: user._id, // Add this line
      });

    // No need to include the redundant `res.json({ userId: user._id });` line here
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});



module.exports = router;
