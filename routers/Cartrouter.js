const { synccart } = require("../controllers/Cartcontroller")
const { protect } = require("../middleware/auth")
const cartRouter = require("express").Router()

cartRouter.post("/sync",protect, synccart)

module.exports = cartRouter