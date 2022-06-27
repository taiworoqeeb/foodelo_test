const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 20
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 20,
        select: false,
    },
    phone_no:{
        type: String,
        required: false,
    },
    address:{
        type: String
    },
    role: {
        type: String,
        enum: ["user","admin"],
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

module.exports = new mongoose.model("Users", UserSchema)