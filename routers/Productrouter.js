const express = require("express")
const fileupload = require("express-fileupload")
const { createproduct, getProduct, getProductById, deleteProduct, updateProduct, editbrand, add_images } = require("../controllers/productcontroller.js")
const ProductRuter = express.Router()
const {protect,authorize} = require("../middleware/auth")

ProductRuter.post("/create",protect,authorize("admin","superadmin"), fileupload({ createParentPath: true }), createproduct)
ProductRuter.get("/", getProduct)
ProductRuter.get("/:id", getProductById)
ProductRuter.post(
    "/other-images/:id",
    protect,
    authorize("admin", "superadmin"),
    fileupload({ createParentPath: true }),
    add_images
  )
ProductRuter.delete("/delete/:id",protect,authorize("admin","superadmin"), deleteProduct)
ProductRuter.patch("/update/:id",protect,authorize("admin","superadmin"), updateProduct)
ProductRuter.put("/edit/:id",protect,authorize("admin","superadmin"), fileupload({ createParentPath: true }), editbrand)

module.exports = { ProductRuter }