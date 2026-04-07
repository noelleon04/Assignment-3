const mongoose = require("mongoose");

const countriesSchema = new mongoose.Schema({
    filename: String,
    description: String,
    price: Number,
    status: String
});

const Country = mongoose.model("Country", countriesSchema, "countries");

module.exports= Country;