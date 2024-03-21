const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    email:{
        type: String, 
        required: true, 
        unique: true
    },
    priority: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    called:{
        type: Boolean,
        default: false
    }

});

// Create User model
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
