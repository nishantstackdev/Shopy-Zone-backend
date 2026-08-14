const mongoose = require("mongoose")

const productDetailsSchema = new mongoose.Schema({
    product_id: { type:mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    name: String,
    image: String,
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    items: {
        type: [productDetailsSchema],
        required: true
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        pincode: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: "India" },
    },
    paymentMethod  :{
        type:String,
        enum : ["cod","online"],
        required:true
    },
    paymentStatus:{
        type:String,
        enum : ["pending","paid","failed"],
        default : "pending"
    },
    orderStatus : {
        type:String,
        enum : [
            "placed",
            "confirmed",
            "shipping",
            "out_for_deleivery",
            "delivered",
            "cancelled",
            "returned"
        ],
        default:"placed"
    },
    totalAmount : {
        type:Number,
        required:true
    },
    razorpay_payment_id:{
        type:String,
        default:null
    },
    razorpay_order_id:{
        type:String,
        default:null
    },
    paidAt:Date,
    deliveredAt:Date,

},{timestamps:true})

const OrderModel = mongoose.model("order",orderSchema)
module.exports = OrderModel