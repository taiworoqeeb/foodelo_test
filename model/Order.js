const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
   cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts"
    },
    total_price: {
        type: Number
    }
    
}, {timestamps: true});

module.exports = new mongoose.model("orders", OrderSchema)