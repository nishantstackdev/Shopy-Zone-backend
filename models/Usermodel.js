const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    phone: {
        type: String,
        match: [/^[0-9]{10}$/, "Enter valid phone number"]
    },

    role: {
        type: String,
        enum: ["user", "admin", "superAdmin"],
        default: "user"
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    addresses: [
        {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            pincode: { type: String, required: true },
            addressLine: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, default: "India" },
            isDefault: { type: Boolean, default: false }
        }
    ],

    otp: {
        type: String
    },

    otpexpire: {
        type: Date
    },

    status: {
        type: Boolean,
        default: true
    }

}, { timestamps: true })
const Usermodel = mongoose.model("user",userSchema)

module.exports = Usermodel