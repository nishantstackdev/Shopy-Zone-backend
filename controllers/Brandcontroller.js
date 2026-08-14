const BrandModel = require("../models/Brandmodel")
const { uniqueName } = require("../utils/helper")

const createBrand = async (req, res) => {
    try {
        const { name, slug, category_id } = req.body
        const brand_logo = req.files.image
        if (!name || !slug || !brand_logo || !category_id) {
            return res.status(400).json({
                message: "All Fields are required",
                success: false
            })
        }

        const isbrandexist = await BrandModel.findOne({ name })
        if (isbrandexist) {
            return res.status(409).json({
                message: "Brand already exists",
                success: false
            })
        }

        const logo = uniqueName(brand_logo.name)
        const destination = "./public/images/brand/" + logo

        brand_logo.mv(
            destination,
            async (error) => {
                if (error) {
                    console.log(error)
                    return res.status(500).json({
                        message: "Unable to upload file",
                        success: false
                    })
                }
                else {
                    await BrandModel.create({ name, slug, image: logo, category_id })
                    return res.status(201).json({
                        message: "Data Created Successfully",
                        success: true
                    })
                }
            }


        )
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const getBrand = async (req, res) => {
    try {
        const query = req.query
        const limit = query.limit ? parseInt(query.limit) : 0
        const filter = {}
        if (query.id) filter._id = query.id
        if (query.status) {
            filter.status = query.status === "true"
        }
        if (query.is_home) {
            filter.is_home = query.is_home === "true"
        }
        // console.log(query)
        const allBrand = await BrandModel
            .find(filter)
            .limit(limit)
            .populate({
                path: "category_id",
                select: "name"
            });
        return res.status(200).json({
            message: "Data founded",
            success: true,
            allBrand
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const getBrandById = async (req, res) => {
    try {
        const id = req.params.id
        const allBrand = await BrandModel.findById(id)
        return res.status(200).json({
            message: "Data founded",
            success: true,
            allBrand
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const deleteBrand = async (req, res) => {
    try {

        const id = req.params.id
        const isbrandexist = await BrandModel.findById(id)
        if (!isbrandexist) {
            return res.status(409).json({
                message: "Data not found",
                success: false
            })
        }

        await BrandModel.deleteOne({ _id: id })
        return res.status(200).json({
            message: "Brand Deleted Successfully",
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const updateBrand = async (req, res) => {
    try {
        const { field } = req.body
        const id = req.params.id
        const isbrandexist = await BrandModel.findById(id)
        if (!isbrandexist) {
            return res.status(409).json({
                message: "Data not found",
                success: false
            })
        }
        const fields = ["is_home", "is_top", "status", "is_popular"]

        // agar field allowed nahi hai
        if (!fields.includes(field)) {
            return res.status(400).json({
                message: "Bad Request",
                success: false
            })
        }


        await BrandModel.findByIdAndUpdate(
            id,
            { [field]: !isbrandexist[field] }

        )


        return res.status(200).json({
            message: "Brand Updated Successfully",
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const editbrand = async (req, res) => {
    try {

        const { name, slug } = req.body
        const id = req.params.id
        const brand_logo = req.files ? req.files.image : null

        const isbrandexist = await BrandModel.findById(id)

        if (!isbrandexist) {
            return res.status(404).json({
                message: "brand Not found",
                success: false
            })
        }

        const update = {}

        if (name) update.name = name
        if (slug) update.slug = slug

        // console.log(update, "update")

        if (brand_logo) {

            const image = uniqueName(brand_logo.name)
            const destination = "./public/images/brand/" + image

            brand_logo.mv(destination, async (error) => {

                if (error) {
                    return res.status(500).json({
                        message: "Internal Server Error",
                        success: false
                    })
                }

                update.image = image

                await BrandModel.findByIdAndUpdate(id, {
                    $set: update
                })

                res.status(201).json({
                    message: "Category Updated Successfully",
                    success: true
                })
            })

        } else {

            await BrandModel.findByIdAndUpdate(id, {
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

module.exports = { createBrand, getBrand, getBrandById, deleteBrand, updateBrand, editbrand }