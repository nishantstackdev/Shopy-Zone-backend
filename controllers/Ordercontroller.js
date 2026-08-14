const cartModel = require("../models/Cartmodel");
const OrderModel = require("../models/Ordermodel");
const Razorpay = require("razorpay");
const crypto = require("crypto")

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const Ordercreate = async (req, res) => {
    try {
        const { paymentMethod, address } = req.body
        const userId = req.user._id
        let userCart = await cartModel.findOne({ userId })
            .populate({
                path: "items.productId",
                select: "_id final_price"
            });

        const productDetails = userCart.items
            .filter(item => item.productId)
            .map(item => {
                const { _id, final_price } = item.productId;

                return {
                    product_id: _id,
                    qty: item.qty,
                    price: final_price,
                    total: final_price * item.qty
                };
            });

        const total_Amount = productDetails.reduce((sum, item) => sum + item.total, sum = 0);

        const order = await OrderModel.create({
            user: userId,
            items: productDetails,
            shippingAddress: address,
            paymentMethod: "cod",
            totalAmount: total_Amount,
            paymentStatus: "pending"

        })

        if (paymentMethod === "cod") {
            //COD
            res.status(201).json({
                message: "order placed",
                success: true,
                orderId: order._id

            })

        } else if (paymentMethod === "online") {
            //Payment Gateway
            var options = {
                amount: total_Amount * 100,  // Amount is in currency subunits. 
                currency: "INR",
                receipt: order._id
            };
            instance.orders.create(options, function (err, razorpayOrder) {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: "Payment failed",
                        success: false
                    })
                };

                order.razorpay_order_id = razorpayOrder.id;
                order.paymentMethod = "online"
                order.save();
                res.status(200).json({
                    message: "Order Create Successfully",
                    success: true,
                    orderId: order._id,
                    payment_order_Id: razorpayOrder.id,
                })
            }
            )
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
};
const paymentVerify = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        const order = await OrderModel.findOne({ razorpay_order_id })

        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex")

        if (expectedSignature === razorpay_signature) {


            order.razorpay_payment_id = razorpay_payment_id
            order.paymentStatus = "paid"
            order.save()

            return res.status(200).json({
                message: "Payment Verified Successfully",
                success: true
            })
        }
    } catch (error) {
        console.log(error)
        return res.status.json({
            message: "Internal Server Error",
            success: false
        })
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find()
            .populate("user", "name email")
            .populate("items.product_id", "name price thumbnail")
            .sort({ createdAt: -1 })
        res.status(200).json({
            count: orders.length,
            success: true,
            orders
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const updateOrderStatus = async (req, res) => {
    try {

        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "placed",
            "confirmed",
            "shipping",
            "out_for_deleivery",
            "delivered",
            "cancelled",
            "returned"
        ];

        // Validate status
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await OrderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update status
        order.orderStatus = status;

        // Optional timestamps
        if (status === "delivered") {
            order.deliveredAt = new Date();
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = updateOrderStatus;

module.exports = { Ordercreate, paymentVerify, getOrders, updateOrderStatus };