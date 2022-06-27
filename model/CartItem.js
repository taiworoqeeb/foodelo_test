const mongoose = require('mongoose');

const CartSchema = mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "products"
    },
    quantity:{
        type: Number
    },
    price: {
        type: Number
    }
    
}, {timestamps: true});

module.exports = new mongoose.model("cartitem", CartSchema)