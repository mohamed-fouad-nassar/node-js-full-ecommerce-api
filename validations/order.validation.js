import {body} from "express-validator";
import {productStatusEnum} from "../models/order.model.js";

export const createOrderValidation = [
    body("items")
        .exists()
        .withMessage("Items are required")
        .isArray({ min: 1, max: 20 })
        .withMessage("Items must be a non-empty array between 1 and 20 items max"),
    body("items.*.productId")
        .exists()
        .withMessage("ProductId is required")
        .isMongoId()
        .withMessage("Invalid Product Id"),
    body("items.*.qty")
        .exists()
        .withMessage("name field is required")
        .notEmpty()
        .withMessage("name cannot be empty")
        .isInt({ min: 1, max: 20 })
        .withMessage("quantity must be a number between 1 and 20"),
    body("discount")
        .optional()
        .default(0)
        .isFloat({ min: 0 })
        .withMessage("Discount must be 0 or greater")
]

export const updateOrderValidation = [
    body("status")
        .exists()
        .withMessage("Status field is required")
        .notEmpty()
        .withMessage("Status cannot be empty")
        .isIn([...productStatusEnum])
        .withMessage(`Invalid order status. it must be one of these [${productStatusEnum.join(", ")}]`),
]