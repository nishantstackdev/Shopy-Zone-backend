const express = require("express")
const fileupload = require("express-fileupload")
const { createBrand, getBrand, getBrandById, deleteBrand, updateBrand, editbrand } = require("../controllers/Brandcontroller")
const BrandRouter = express.Router()
const {protect,authorize} = require("../middleware/auth")

BrandRouter.post("/create",protect,authorize("admin","superadmin"), fileupload({ createParentPath: true }), createBrand)
BrandRouter.get("/", getBrand)
BrandRouter.get("/:id", getBrandById)
BrandRouter.delete("/delete/:id",protect,authorize("admin","superadmin"), deleteBrand)
BrandRouter.patch("/update/:id",protect,authorize("admin","superadmin"), updateBrand)
BrandRouter.put("/update/:id",protect,authorize("admin","superadmin"), fileupload({ createParentPath: true }), editbrand)

module.exports = { BrandRouter }