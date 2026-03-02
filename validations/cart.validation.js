import { body } from "express-validator";

export const cartProductIdValidation = [
    body("productId")
        .notEmpty()
        .withMessage("Product ID is required")
        .isMongoId()
        .withMessage("Invalid product ID")
]

export const cartDetailsValidation = [
    ...cartProductIdValidation,
    body("qty")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer"),
];