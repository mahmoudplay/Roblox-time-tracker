import mongoose, {Schema, SchemaTypes } from "mongoose";

const timeSchema = new Schema({
    username: SchemaTypes.String,
    userId: {
        type: SchemaTypes.Number,
        unique: true,
    },
    time: SchemaTypes.Number,
    funds: {
        type: SchemaTypes.Number,
        default: 0
    }
});

const timeTracker = mongoose.model("Time", timeSchema, "Time");

export default timeTracker