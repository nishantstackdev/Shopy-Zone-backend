const { Ordercreate,paymentVerify, getOrders, updateOrderStatus } = require("../controllers/Ordercontroller")
const { protect,authorize } = require("../middleware/auth")
const Orderrouter = require("express").Router()

Orderrouter.post("/create",protect, Ordercreate)
Orderrouter.post("/verify",protect,paymentVerify)
Orderrouter.get("/",protect,authorize("admin","superadmin"),getOrders)
Orderrouter.put("/status",protect,authorize("admin","superadmin"),updateOrderStatus)
module.exports = Orderrouter