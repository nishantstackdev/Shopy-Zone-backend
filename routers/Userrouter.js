const express = require("express")
const { register, login, verifyEmail, resetOtp, getMe, logout, addAddress } = require("../controllers/Usercontroller")
const { protect } = require("../middleware/auth")

const UserRouter = express.Router()
UserRouter.post("/create", register)
UserRouter.post("/login", login)
UserRouter.post("/verify-otp", verifyEmail)
UserRouter.post("/reset-otp", resetOtp)
UserRouter.get("/get",protect,  getMe)
UserRouter.get("/logout", logout)
UserRouter.post("/add-address",protect,addAddress)
module.exports = { UserRouter }