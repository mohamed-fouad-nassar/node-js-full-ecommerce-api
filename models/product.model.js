import {model, Schema} from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        min: [3, "Name must be at least 3 characters"],
        max: [50, "Name must be at most 50 characters"],
    },
    description: {
        type: String,
        trim: true,
        required: [true, "Description is required"],
        min: [3, "Description must be at least 3 characters"],
        max: [500, "Description must be at most 500 characters"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be at least 0"],
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        min: [0, "Stock must be at least 0"],
        validate: {
            validator: Number.isInteger,
            message: "Stock must be an integer",
        }
    },
    image: {
        type: String,
        trim: true,
        required: [true, "Image is required"],
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category id is required"],
    },
}, { timestamps: true });

export default model("Product", productSchema);