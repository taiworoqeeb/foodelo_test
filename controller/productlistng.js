const Product = require("../model/product");


exports.addProduct = async(req, res, next)=>{
    const {name, description, price} = req.body;
    try {
        const new_product = new Product({
            name,
            description,
            price
        })

        const saved_product  = await new_product.save();

        res.status(201).json({
            status: true,
            message: "Product added successfully",
            data: saved_product
        })
    } catch (error) {
        console.error(error)
        res.json(error)
        next(error)
    }
}

exports.getProduct = async(req, res, next)=>{
    try {
        await Product.find()
        .then(async(product)=>{
            if(product){
                res.status(200).json({
                    status: true,
                    data: product
                })
            }else{
                res.status(404).json({
                    status: false,
                    message: "Products not found"
                })
            }
        })
    } catch (error) {
        console.error(error)
        res.json(error)
        next(error)
    }
}