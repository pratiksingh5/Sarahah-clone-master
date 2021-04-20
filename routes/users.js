var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose'); 

mongoose.connect('mongodb://localhost/sarahah');



var userSchema = mongoose.Schema({
  username: String,
  password: String,
  name: String,
  profilePic: {
    type: String,
    default: './images/def.jpg'
  },
  gender: String,
  email: String,
  about: String,
  relationshipStatus: String,
  messages: Array
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema);