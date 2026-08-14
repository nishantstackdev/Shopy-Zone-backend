const ColorModel = require("../models/Colormodel")


const createcolor = async (req, res) => {
    try {

        const { name, slug, hex_code } = req.body

        // console.log(req.body)

        if (!name || !slug || !hex_code) {
            return res.status(400).json({
                message: "All Fields are required",
                success: false
            })
        }

        const iscolorexist = await ColorModel.findOne({ name })

        if (iscolorexist) {
            return res.status(409).json({
                message: "Color already exists",
                success: false
            })
        }

        await ColorModel.create({
            name,
            slug,
            hex_code
        })

        return res.status(201).json({
            message: "Color Created Successfully",
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

const getcolor = async (req, res) => {
    try {
        const allColor = await ColorModel.find()
        return res.status(200).json({
            message: "Data founded",
            succcess: true,
            allColor
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}
const getcolorById = async (req, res) => {
    try {
        const id = req.params.id
        const allColor = await ColorModel.findById(id)
        return res.status(200).json({
            message: "Data founded",
            succcess: true,
            allColor
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}
const deleteColor = async (req, res) => {
    try {

        const id = req.params.id
        const iscolorexist = await ColorModel.findById(id)
        if (!iscolorexist) {
            return res.status(409).json({
                message: "Data not found",
                success: false
            })
        }

        await ColorModel.deleteOne({ _id: id })
        return res.status(200).json({
            message: "Color Deleted Successfully",
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

const updateColor = async (req, res) => {
    try {
        const { field } = req.body
        const id = req.params.id
        const iscolorexist = await ColorModel.findById(id)
        if (!iscolorexist) {
            return res.status(409).json({
                message: "Data not found",
                success: false
            })
        }

        const fields = ["status"]

        // agar field allowed nahi hai
        if (!fields.includes(field)) {
            return res.status(400).json({
                message: "Bad Request",
                success: false
            })
        }


        await ColorModel.findByIdAndUpdate(
            id,
            { [field]: !iscolorexist[field] }

        )
        return res.status(200).json({
            message: "Color Updated Successfully",
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

const editColor = async (req, res) => {
    try {

        const { name, slug, hex_code } = req.body
        const id = req.params.id


        const iscolorexist = await ColorModel.findById(id)

        if (!iscolorexist) {
            return res.status(404).json({
                message: "Color Not found",
                success: false
            })
        }

        const update = {}

        if (name) update.name = name
        if (slug) update.slug = slug
        if (hex_code) update.hex_code = hex_code

        // console.log(update, "update")

       

            await ColorModel.findByIdAndUpdate(id, {
                $set: update
            })

            res.status(201).json({
                message: "Color Updated Successfully",
                success: true
            })
        

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

module.exports = { createcolor, getcolor, deleteColor, updateColor, getcolorById, editColor}