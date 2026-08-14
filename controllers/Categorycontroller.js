const categorymodel = require("../models/Categorymodel")
const { uniqueName } = require("../utils/helper")

const createcategory = async (req, res) => {
    try {
        const { name, slug } = req.body
        const category_image = req.files.image //isme uploaded image ka name save hoga

        if (!name || !slug || !category_image) { //image bhi upload karni jaruri hain 
            return res.status(200).json({
                message: "All fields are required",
                success: false
            })
        }
        const category = await categorymodel.findOne({ name })
        if (category) {
            return res.status(400).json({
                message: "Data Already Exist",
                success: false
            })
        }
        const image = uniqueName(category_image.name)
        const destination = "./public/images/category/" + image //iss destination par image save hogi
        category_image.mv(
            destination,
            async (error) => {
                if (error) {
                    return res.status(500).json({
                        message: "Unable to upload file",
                        success: false
                    })
                }
                await categorymodel.create({
                    name, slug, image: image //image me vhi image ka name save hoga
                })
                res.status(201).json({
                    message: "Data Created Successfully",
                    success: true
                })

            })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const getcategory = async (req, res) => {
    try {
        const query = req.query
        const filter = {}
        const limit = query.limit ? parseInt(query.limit) : 0
        if(query.id) filter._id = query.id
        if(query.status){
            filter.status = query.status==="true"
        }
        if(query.is_top){
            filter.is_top = query.is_top==="true"
        }
        if(query.is_popular){
            filter.is_popular = query.is_popular==="true"
        }
        // console.log(filter)
        const allcategories = await categorymodel.find(filter).limit(limit)
        res.status(201).json({
            message: "Data found",
            success: true,
            allcategories
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}


const getById = async (req, res) => {
    try {
        const id = req.params.id
        const allcategories = await categorymodel.findById(id)
        res.status(201).json({
            message: "Data found",
            success: true,
            allcategories
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const updatecategory = async (req, res) => {
    try {
        console.log(req.cookies)
        const { field } = req.body
        const id = req.params.id

        const fields = ["is_home", "is_top", "status", "is_popular"]

        // agar field allowed nahi hai
        if (!fields.includes(field)) {
            return res.status(400).json({
                message: "Bad Request",
                success: false
            })
        }

        const iscategoryexist = await categorymodel.findById(id)

        if (!iscategoryexist) {
            return res.status(404).json({
                message: "Data not found",
                success: false
            })
        }

        await categorymodel.findByIdAndUpdate(
            id,
            { [field]: !iscategoryexist[field] },
            { new: true }
        )

        res.status(200).json({
            message: "Data updated successfully",
            success: true
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const deletecategory = async (req, res) => {
    try {
        const id = req.params.id
        const iscategoryexist = await categorymodel.findById(id)
        if (!iscategoryexist) {
            res.status(409).json({
                message: "Data not found",
                success: false
            })
        }

        await categorymodel.deleteOne(
            { _id: id }
        )
        res.status(201).json({
            message: "Data deleted successfully",
            success: true
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const editcategory = async (req, res) => {
    try {

        const { name, slug } = req.body
        const id = req.params.id
        const category_image = req.files ? req.files.image : null

        const iscategoryexist = await categorymodel.findById(id)

        if (!iscategoryexist) {
            return res.status(404).json({
                message: "Category Not found",
                success: false
            })
        }

        const update = {}

        if (name) update.name = name
        if (slug) update.slug = slug

        console.log(update, "update")

        if (category_image) {

            const image = uniqueName(category_image.name)
            const destination = "./public/images/category/" + image

            category_image.mv(destination, async (error) => {

                if (error) {
                    return res.status(500).json({
                        message: "Internal Server Error",
                        success: false
                    })
                }

                update.image = image

                await categorymodel.findByIdAndUpdate(id, {
                    $set: update
                })

                res.status(201).json({
                    message: "Category Updated Successfully",
                    success: true
                })
            })

        } else {

            await categorymodel.findByIdAndUpdate(id, {
                $set: update
            })

            res.status(201).json({
                message: "Category Updated Successfully",
                success: true
            })
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

module.exports = { createcategory, getcategory, updatecategory, deletecategory, getById, editcategory }