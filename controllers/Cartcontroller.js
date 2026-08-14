const cartModel = require("../models/Cartmodel")
const synccart = async(req,res)=>{
    try {
        const userId = req.user._id;
        const localCart = JSON.parse(req.body.localCart) || [];

        if (localCart.length === 0) {
            const userCart = await cartModel.findOne({ userId }).populate({
                path: "items.productId",
                select: "name _id original_price final_price discount_price price thumbnail stock"
            });

            return res.status(200).json({
                message: "Fetched cart from server",
                success: true,
                cart: userCart ? userCart.items : []
            });
        }

        let userCart = await cartModel.findOne({ userId })
            .populate({
                path: "items.productId",
                select: "name _id original_price final_price discount_price price thumbnail stock"
            });


        // If no cart → create new
        if (!userCart) {
            userCart = new cartModel({
                userId,
                items: []
            });
        }
        localCart.forEach((cartItem) => {
            const { id, qty } = cartItem;
            const existingItem = userCart.items.find(
                (item) => {
                    return item.productId._id == id
                }
            );

            if (existingItem) {
                existingItem.qty += qty;
            } else {
                userCart.items.push({
                    productId: id,
                    qty
                });
            }
        });

        await userCart.save();

        res.status(200).json({
            message: "Cart synced successfully",
            success: true,
            cart: userCart

        });

    } catch (error) {
        console.log(error);
        return res.send(500).json({
            message:"Internal server error",
            success:false
        })
    }
};
const addTocart = async(req,res)=>{
    try {
        const userId = req.user._id;
        const localCart = JSON.parse(req.body.localCart) || [];

        if (localCart.length === 0) {
            const userCart = await cartModel.findOne({ userId }).populate({
                path: "items.productId",
                select: "name _id original_price final_price discount_price price thumbnail stock"
            });

            return res.status(200).json({
                message: "Fetched cart from server",
                success: true,
                cart: userCart ? userCart.items : []
            });
        }

        let userCart = await cartModel.findOne({ userId })
            .populate({
                path: "items.productId",
                select: "name _id original_price final_price discount_price price thumbnail stock"
            });


        // If no cart → create new
        if (!userCart) {
            userCart = new cartModel({
                userId,
                items: []
            });
        }
        localCart.forEach((cartItem) => {
            const { id, qty } = cartItem;
            const existingItem = userCart.items.find(
                (item) => {
                    return item.productId._id == id
                }
            );

            if (existingItem) {
                existingItem.qty += qty;
            } else {
                userCart.items.push({
                    productId: id,
                    qty
                });
            }
        });

        await userCart.save();

        res.status(200).json({
            message: "Cart synced successfully",
            success: true,
            cart: userCart

        });

    } catch (error) {
        console.log(error);
        return res.send(500).json({
            message:"Internal server error",
            success:false
        })
    }
}
module.exports = {synccart}
