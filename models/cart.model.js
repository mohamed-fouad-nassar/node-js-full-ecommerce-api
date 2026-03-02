import {model, Schema} from "mongoose";

const cartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    qty: {
        type: Number,
        required: true,
        min: [1, "Quantity must be greater than 0"],
    }
},
{_id: false}
);

const cartSchema = new Schema({
    items: {
        type: [cartItemSchema],
        default: [],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    }
},
{timestamps: true}
);

export default model("Cart", cartSchema);