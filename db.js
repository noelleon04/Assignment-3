const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
    if (isConnected) return;

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI missing");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;

    console.log("Connected to MongoDB");
}

module.exports = connectDB;