const mongoose = require("mongoose")
const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    hex_code : {
        type:String,
        default:null
    },
    
    status: {
        type: Boolean,
        default: true
    }
    
}, {
    timestamps: true
})
const ColorModel = mongoose.model("color", ColorSchema)
module.exports = ColorModel