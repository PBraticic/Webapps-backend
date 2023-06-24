const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,  // Added this line
  email: String,
  password: String,
  userType: String, // userType can be 'user' or 'employee'
});

module.exports = mongoose.model('User', userSchema);