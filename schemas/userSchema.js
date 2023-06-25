const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,  
  email: String,
  password: String,
  userType: String, 
});

module.exports = mongoose.model('User', userSchema);