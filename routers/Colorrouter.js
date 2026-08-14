const express = require("express")
const { createcolor, getcolor, deleteColor, updateColor, getcolorById, editColor } = require("../controllers/Colorcontroller")

const ColorRouter = express.Router()
const {protect,authorize} = require("../middleware/auth")

ColorRouter.post("/create",protect,authorize("admin","superadmin"), createcolor)
ColorRouter.get("/", getcolor)
ColorRouter.get("/:id", getcolorById)
ColorRouter.delete("/delete/:id",protect,authorize("admin","superadmin"), deleteColor)
ColorRouter.patch("/update/:id",protect,authorize("admin","superadmin"), updateColor)
ColorRouter.put("/update/:id",protect,authorize("admin","superadmin"), editColor)

module.exports = { ColorRouter }