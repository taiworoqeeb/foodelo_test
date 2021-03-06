const mongoose = require('mongoose');

const CartSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
   cartItem:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartitem"
    }]
    
}, {timestamps: true});

module.exports = new mongoose.model("carts", CartSchema)