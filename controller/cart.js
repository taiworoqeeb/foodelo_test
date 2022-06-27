const CartItem = require("../model/CartItem");
const Cart = require("../model/Carts");
const Product = require("../model/product");


exports.addCartItem = async(req, res, next)=>{
    const productId = req.params.productId;
    var {quantity} = req.body;
    try {
        if(!quantity || quantity === undefined || quantity === null){
            quantity = 1
        }
        await Product.findById(productId)
        .then(async(product)=>{
            if(product){
                await CartItem.findOne({
                    product: product._id
                }).then(async(cartitem)=>{
                    if(cartitem){
                        await CartItem.findByIdAndUpdate(cartitem._id, {
                            quantity: quantity,
                            price: (product.price * quantity)
                        })

                            const cart = await Cart.findOne({user: req.user.id})
                            .populate(["user", 
                                {
                                    path: "cartItem",
                                    populate:{
                                        path: "product", 
                                        model: "products"
                                        }
                                    }
                            ])
                            res.json({
                                status: true,
                                data: cart
                            })

                    }else{
                        const item = new CartItem({
                            product: product._id,
                            quantity: quantity,
                            price: (product.price * quantity)
                        })
        
                        const new_item = await item.save();

                        await Cart.findOneAndUpdate({user: req.user.id}, {
                            $push: { cartItem: new_item._id}
                        }, {new: true}).catch((err) => console.log(err));

                        const cart = await Cart.findOne({user: req.user.id})
                        .populate(["user", 
                            {
                                path: "cartItem",
                                populate:{
                                    path: "product", 
                                    model: "products"
                                    }
                                }
                        ])
                        res.json({
                            status: true,
                            data: cart
                        })
                    }
                })
                
            }else{
                res.satus(404).json({
                    status: false,
                    message: "No products found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error)
        next(error);
    }
}

exports.removeCartItem = async(req, res, next)=>{
    const id = req.params.cartitemId
    try {
        await CartItem.findById(id)
        .then(async(item)=>{
            if(item){
                await Cart.updateOne({user: req.user.id}, {
                    $pull:{
                        cartItem: item._id
                    }
                });
                await CartItem.findByIdAndDelete(item._id);
                res.json({
                    status: true,
                    message: "Item removed successfully"
                })
            }else{
                res.json({
                    status: false,
                    message: "Item doesn't exist"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error)
        next(error);
    }
}

exports.getCart = async(req, res, next)=>{
    try {
        await Cart.findOne({user: req.user.id})
        .populate(["user", 
            {
                path: "cartItem",
                populate:{
                    path: "product", 
                    model: "products"
                    }
                }
        ]).then(cart=>{
            if(cart){
                res.json({
                    status: true,
                    data: cart
                })
            }else{
                res.json({
                    status: false,
                    message: "Cart is empty"
                })
            }
            
        })
        
    } catch (error) {
        console.log(error);
        res.json(error)
        next(error);
    }
}
