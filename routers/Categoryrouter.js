const express = require("express")
const { createcategory, getcategory, updatecategory, deletecategory, getById, editcategory } = require("../controllers/Categorycontroller")
const categoryrouter = express.Router()
const fileUpload = require("express-fileupload")
const {protect,authorize} = require("../middleware/auth")

categoryrouter.post("/create", protect,authorize("admin","superadmin"),fileUpload({ createParentPath: true }), createcategory)
categoryrouter.get("/", getcategory)
categoryrouter.get("/:id", getById)
categoryrouter.patch("/update/:id",protect,authorize("admin","superadmin"), updatecategory)
categoryrouter.put("/update/:id", protect,authorize("admin","superadmin"),fileUpload({ createParentPath: true }), editcategory)
categoryrouter.delete("/delete/:id", protect,authorize("admin","superadmin"),deletecategory)

module.exports = categoryrouter