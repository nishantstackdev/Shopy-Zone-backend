require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const categoryrouter = require('./routers/Categoryrouter')
const { BrandRouter } = require('./routers/Brandrouter')
const { ColorRouter } = require('./routers/Colorrouter')
const { ProductRuter } = require('./routers/Productrouter')
const { UserRouter } = require('./routers/Userrouter')
const cookieParser = require('cookie-parser')
const cartRouter = require('./routers/Cartrouter')
const Orderrouter = require('./routers/Orderrouter')


const server = express()

server.use(cors({
    origin: [
        "http://localhost:3000",
    ],
    credentials: true
}))
server.use(express.json())
server.use(cookieParser())
server.use("/category", categoryrouter)
server.use("/brand", BrandRouter)
server.use("/color", ColorRouter)
server.use("/product", ProductRuter)
server.use("/user", UserRouter)
server.use("/cart", cartRouter)
server.use("/order", Orderrouter)

server.use(express.static("public"))

mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Database Connected successfully")

        server.listen(process.env.PORT, () => {
            console.log("Server Started on port", process.env.PORT)
        })

    })
    .catch((err) => {
        console.log("DB not connected", err)
    })