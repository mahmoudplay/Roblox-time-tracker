import mongoose, {Schema, SchemaTypes } from "mongoose";

const vaildSchemea = new mongoose.Schema({
    userId: Number,
    vCode: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60
    }
})

const validationCode = mongoose.model("Validation", vaildSchemea, "Validation");

export default validationCode;