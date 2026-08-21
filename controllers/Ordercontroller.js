const cartModel = require("../models/Cartmodel");
const OrderModel = require("../models/Ordermodel");
const Razorpay = require("razorpay");
const crypto = require("crypto")

const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.replace(/^"|"$/g, "")
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.replace(/^"|"$/g, "")

const instance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
});

const Ordercreate = async (req, res) => {
    try {
        const { paymentMethod, address } = req.body
        const userId = req.user._id

        if (!address) {
            return res.status(400).json({
                message: "Delivery address is required",
                success: false,
            })
        }

        const userCart = await cartModel.findOne({ userId })
            .populate({
                path: "items.productId",
                select: "_id final_price"
            });

        if (!userCart?.items?.length) {
            return res.status(400).json({
                message: "Cart is empty",
                success: false,
            })
        }

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

        if (!productDetails.length) {
            return res.status(400).json({
                message: "No valid products in cart",
                success: false,
            })
        }

        const total_Amount = productDetails.reduce((sum, item) => sum + item.total, 0);
        const amountPaise = Math.round(total_Amount * 100)

        const order = await OrderModel.create({
            user: userId,
            items: productDetails,
            shippingAddress: address,
            paymentMethod: paymentMethod === "online" ? "online" : "cod",
            totalAmount: total_Amount,
            paymentStatus: "pending"
        })

        if (paymentMethod === "cod") {
            return res.status(201).json({
                message: "order placed",
                success: true,
                orderId: order._id
            })
        }

        if (paymentMethod === "online") {
            if (amountPaise < 100) {
                await OrderModel.findByIdAndDelete(order._id)
                return res.status(400).json({
                    message: "Minimum order amount for online payment is ₹1",
                    success: false,
                })
            }

            if (!razorpayKeyId || !razorpayKeySecret) {
                await OrderModel.findByIdAndDelete(order._id)
                return res.status(500).json({
                    message: "Payment gateway is not configured",
                    success: false,
                })
            }

            const options = {
                amount: amountPaise,
                currency: "INR",
                receipt: String(order._id),
            };

            instance.orders.create(options, function (err, razorpayOrder) {
                if (err) {
                    console.error("Razorpay order error:", err)
                    OrderModel.findByIdAndDelete(order._id).catch(() => {})
                    return res.status(500).json({
                        message: "Payment failed",
                        success: false
                    })
                }

                order.razorpay_order_id = razorpayOrder.id;
                order.paymentMethod = "online"
                order.save();

                return res.status(200).json({
                    message: "Order Create Successfully",
                    success: true,
                    orderId: order._id,
                    payment_order_Id: razorpayOrder.id,
                    amount: amountPaise,
                })
            })
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

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "Missing payment verification fields",
                success: false,
            })
        }

        const order = await OrderModel.findOne({ razorpay_order_id })

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                success: false,
            })
        }

        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                message: "Payment already verified",
                success: true,
            })
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(body)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature",
                success: false,
            })
        }

        order.razorpay_payment_id = razorpay_payment_id
        order.paymentStatus = "paid"
        await order.save()

        return res.status(200).json({
            message: "Payment Verified Successfully",
            success: true,
            orderId: order._id,
        })
    } catch (error) {
        console.error("paymentVerify:", error)
        return res.status(500).json({
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

        order.orderStatus = status;

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

module.exports = { Ordercreate, paymentVerify, getOrders, updateOrderStatus };
