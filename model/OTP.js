const mongoose = require('mongoose');
const Token = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    token:{
        type: Number
    }
}, {timestamps: true});

module.exports = new mongoose.model("OTPs", Token)