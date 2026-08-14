const categorymodel = require("../models/Categorymodel")
const ProductModel = require("../models/Productmodel")
const BrandModel = require("../models/Brandmodel")
const { uniqueName } = require("../utils/helper")
const fs = require("fs")
const ColorModel = require("../models/Colormodel")

const createproduct = async (req, res) => {
    try {
        const { name, slug, category_id, short_description, long_description, original_price, discount_price, final_price, brand_Id, color_ids } = req.body
        const thumbnail = req.files?.thumbnail
        if (
            !name ||
            !slug ||
            !thumbnail ||
            !category_id ||
            !short_description ||
            !long_description ||
            !original_price ||
            !discount_price ||
            !final_price ||
            !brand_Id ||
            !color_ids) {
            return res.status(400).json({
                message: "All Fields are required",
                success: false
            })
        }

        const isproductexist = await ProductModel.findOne({ name })
        if (isproductexist) {
            return res.status(409).json({
                message: "product already exists",
                success: false
            })
        }

        const image = uniqueName(thumbnail.name)
        const destination = "./public/images/product/" + image

        thumbnail.mv(
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

                    await ProductModel.create({ name, slug, thumbnail: image, category_id, short_description, long_description, original_price, discount_price, final_price, brand_Id, color_ids: JSON.parse(color_ids) })
                    return res.status(201).json({
                        message: "Data Created Successfully",
                        success: true
                    })

                }
            }
        )
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const getProduct = async (req, res) => {
    try {

        const query = req.query
        const filter = {}
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 30
        const skip = (page - 1) * limit

        // ==========================================
        // 🔍 NEW: SEARCH QUERY LOGIC INTEGRATION
        // ==========================================
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: "i" } },
                { description: { $regex: query.search, $options: "i" } } 
            ]
        }

        if (query.status)
            filter.status = query.status === "true"

        if (query.is_home)
            filter.is_home = query.is_home === "true"

        if (query.is_popular)
            filter.is_popular = query.is_popular === "true"

        if (query.stock)
            filter.stock = query.stock === "true"

        if (query.id)
            filter._id = query.id

        if (query.category_slug) {

            const category = await categorymodel.findOne({
                slug: decodeURIComponent(query.category_slug)
            })

            if (category) {
                filter.category_id = category._id
            }
        }
        if (query.brand_slug) {

            const brand = await BrandModel.findOne({
                slug: query.brand_slug
            })

            if (brand) {
                filter.brand_Id = brand._id
            }
        }
        if (query.color_slug) {

            const color = await ColorModel.findOne({
                slug: query.color_slug
            })

            if (color) {
                // Ek chota sa bug fixed: Pehle color_ids._id tha jo undefined crash de sakta tha, ab color._id hai.
                filter.color_ids = color._id
            }
        }

        if (query.min_price && query.max_price) {
            filter.final_price = {
                $get: parseInt(query.min_price), // $get ko $gte kiya agar error aaye
                $lte: parseInt(query.max_price)
            }
        }
        // console.log(filter)


        const [total, allProduct] = await Promise.all([

            ProductModel.countDocuments(filter),

            ProductModel.find(filter)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "category_id",
                    select: "name slug"
                })
                .populate({
                    path: "brand_Id",
                    select: "name slug"
                })
                .populate({
                    path: "color_ids",
                    select: "name slug hex_code"
                })

        ])

        return res.status(200).json({
            success: true,
            allProduct,
            total,
            limit,
            pages: Math.ceil(total / limit)
        })

    } catch (error) {

        console.log(error)

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getProductById = async (req, res) => {
    try {
        const id = req.params.id
        const allProduct = await ProductModel.findById(id)
        return res.status(200).json({
            message: "Data founded",
            success: true,
            allProduct
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}
const deleteProduct = async (req, res) => {
    try {

        const id = req.params.id
        const isproductexist = await ProductModel.findById(id)
        if (!isproductexist) {
            return res.status(409).json({
                message: "Data not found",
                success: false
            })
        }

        await ProductModel.deleteOne({ _id: id })
        return res.status(200).json({
            message: "Product Deleted Successfully",
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
const updateProduct = async (req, res) => {
    try {
        const { field } = req.body
        const id = req.params.id

        const allowedFields = ["is_top", "status", "is_home", "is_popular"]

        if (!allowedFields.includes(field)) {
            return res.status(400).json({
                message: "Bad Request",
                success: false
            })
        }

        const product = await ProductModel.findById(id)

        if (!product) {
            return res.status(404).json({
                message: "Data not found",
                success: false
            })
        }

        product[field] = !product[field]
        await product.save()

        return res.status(200).json({
            message: "Product Updated Successfully",
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

        const product = await ProductModel.findById(id)

        if (!product) {
            return res.status(404).json({
                message: "Product Not Found",
                success: false
            })
        }

        const update = {}

        if (name) update.name = name
        if (slug) update.slug = slug

        if (brand_logo) {
            const image = uniqueName(brand_logo.name)
            const destination = "./public/images/product/" + image

            await brand_logo.mv(destination)
            update.image = image
        }

        await ProductModel.findByIdAndUpdate(id, { $set: update })

        res.status(200).json({
            message: "Product Updated Successfully",
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



const add_images = async (req, res) => {
    try {
        const id = req.params.id

        const product = await ProductModel.findById(id)
        if (!product) {
            return res.status(404).json({
                message: "Product Not Found",
                success: false
            })
        }

        // 👇 important check
        if (!req.files || !req.files.images) {
            return res.status(400).json({
                message: "No files uploaded",
                success: false
            })
        }

        // 👇 ensure array
        const images = Array.isArray(req.files.images)
            ? req.files.images
            : [req.files.images]

        const imageNames = []

        for (const file of images) {
            const fileName = uniqueName(file.name)

            const destination = `./public/images/product/other/${fileName}`

            await file.mv(destination)

            imageNames.push(fileName)
        }

        // 👇 push multiple images
        product.images.push(...imageNames)

        await product.save()

        return res.status(201).json({
            message: "Images Added Successfully",
            success: true,
            data: product
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const delete_image = async (req, res) => {
    try {
        const id = req.params.id
        const { image_name } = req.body
        const isproductexist = await ProductModel.findById(id)
        if (!isproductexist) {
            return res.status(404).json({
                message: "product Not found",
                success: false
            })
        }
        await ProductModel.findByIdAndUpdate(
            id,
            { $pull: { images: image_name } }
        )
        fs.unlink(`./public/images/product/other/${image_name}`, (err) => {
            if (err) console.log("Unable to delete image", err)
            return res.status(201).json({
                message: "Images Deleted Successfully",
                success: true
            })
        })


    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

module.exports = { createproduct, getProduct, add_images, delete_image, editbrand, getProductById, deleteProduct, updateProduct }