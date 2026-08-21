require("dotenv").config()
const mongoose = require("mongoose")
const axios = require("axios")

const BASE = `http://localhost:${process.env.PORT || 8000}`
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL || "smoke.test.1787330695@gmail.com"
const TEST_PASSWORD = process.env.SMOKE_TEST_PASSWORD || "Test@12345"

async function run() {
    await mongoose.connect(process.env.DATABASE_URL)
    const Usermodel = require("../models/Usermodel")

    await Usermodel.updateOne({ email: TEST_EMAIL }, { isVerified: true })

    const loginRes = await axios.post(`${BASE}/user/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    })

    const token = loginRes.data.token
    if (!token) throw new Error("Login did not return token")

    const meRes = await axios.get(`${BASE}/user/get`, {
        headers: { Authorization: token },
    })

    if (!meRes.data?.success || !meRes.data?.user?.email) {
        throw new Error("getMe failed via Authorization header")
    }

    console.log("PASS login + getMe:", meRes.data.user.email)

    await Usermodel.deleteOne({ email: TEST_EMAIL })
    console.log("PASS cleaned up smoke test user")
}

run()
    .catch((error) => {
        console.error("FAIL:", error.response?.data || error.message)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.disconnect()
    })
