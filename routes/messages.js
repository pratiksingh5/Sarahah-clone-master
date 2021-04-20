var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/sarahah');




var messagesSchema = mongoose.Schema({
    
    messages: String,
    username: String,
    time: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('message', messagesSchema);