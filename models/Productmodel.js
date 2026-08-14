const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    short_description: {
        type: String,
        maxLength: 200
    },
    long_description: {
        type: String,
        maxLength: 200
    },
    original_price: {
        type: Number,
        required: true
    },
    discount_price: {
        type: Number,
        default: 5
    },
    final_price: {
        type: Number
    },
    category_id: {
        type: mongoose.Schema.ObjectId,
        ref: "category"
    },
    brand_Id: {
        type: mongoose.Schema.ObjectId,
        ref: "brand"
    },
    thumbnail:{
        type:String,
        default:null
    },
    stock:{
        type:Boolean,
        default:true
    },
    topSelling:{
        type:Boolean,
        default:false
    },
    images:[
        {
            type:String
        }
    ],
    color_ids:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"color"
        }
    ],
    status: {
        type: Boolean,
        default: true
    },
    is_top: {
        type: Boolean,
        default: false
    },
    is_home: {
        type: Boolean,
        default: false
    },
    is_popular: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)

const ProductModel = mongoose.model("product", ProductSchema)
module.exports = ProductModel