const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
    },
    description:{
        type: String,
    },
    price:{
        type: Number,
    }
    
}, {timestamps: true});

module.exports = new mongoose.model("products", ProductSchema)