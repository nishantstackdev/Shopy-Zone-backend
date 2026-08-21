    let jwt = require('jsonwebtoken')
    const Usermodel = require('../models/Usermodel')
    const protect = async (req, res, next) => {
        let token = null
        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt
        }

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization
            token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : authHeader
        }

        if (!token) {
            return res.status(401).json({
                message: "Token required",
                success: false
            })
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY)
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token",
                success: false
            })
        }

        req.user = await Usermodel.findOne({ _id: decoded.id }).select("-password")
        if (!req.user) {
            return res.status(403).json({
                message: "User not found",
                success: false
            })
        }
        next()
    }

    function authorize(...roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(403).json({
                    message: "User not found",
                    success: false
                })
            }
            if (!roles.includes(req.user.role)) {
                return res.status(401).json({
                    message: "Not Authorized",
                    success: false
                })
            }
            next()
        }
    }
    module.exports = { protect, authorize }