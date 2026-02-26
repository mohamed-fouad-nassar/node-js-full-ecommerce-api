import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        unique: [true, "Name must be unique"],
        min: [3, "Name must be at least 3 characters"],
        max: [20, "Name must be at most 20 characters"],
    },
    description: {
        type: String,
        trim: true,
        required: [true, "Description is required"],
        min: [3, "Description must be at least 3 characters"],
        max: [400, "Description must be at most 400 characters"],
    }
}, { timestamps: true });

export default model("Category", categorySchema);