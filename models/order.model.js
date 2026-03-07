import {model, Schema} from "mongoose";

export const productStatusEnum = ["pending", "confirmed", "paid", "processing", "shipped", "delivered", "cancelled"];

const orderItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    qty: {
        type: Number,
        required: true,
        min: [1, "Quantity must be greater than 0"],
        max: [20, "Quantity must be at most 20"]
    },
    price: {
        type: Number,
        required: true,
        min: [1, "Price must be greater than 0"],
    }
}, {_id: false});

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true
    },
    subtotal: {
        type: Number,
        default: 0,
        min: [0, "Discount must be greater than or equal 0"],
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount must be greater than or equal 0"],
    },
    total: {
        type: Number,
        default: 0,
        min: [0, "Discount must be greater than or equal 0"],
    },
    status: {
        type: String,
        enum: productStatusEnum,
        default: "pending",
    },
}, {timestamps: true})

export default model("Order", orderSchema);