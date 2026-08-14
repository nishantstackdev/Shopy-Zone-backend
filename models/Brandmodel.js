const mongoose = require("mongoose")
const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    image:{
        type:String,
        default:null
    },
    status: {
        type: Boolean,
        default: true
    },
    is_home: {
        type: Boolean,
        default: false
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
        default:null
    }
}, {
    timestamps: true
})
const BrandModel = mongoose.model("brand", BrandSchema)
module.exports = BrandModel