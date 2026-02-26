import { body } from "express-validator";

export const productRules = {
    name: body("name")
        .isString()
        .trim()
        .escape()
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 3 and 50 characters"),
    description: body("description")
        .isString()
        .trim()
        .escape()
        .isLength({ min: 3, max: 500 })
        .withMessage("Description must be between 3 and 500 characters"),
    price: body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a number ≥ 0")
        .toFloat(),
    stock: body("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be an integer ≥ 0")
        .toInt(),
    image: body("image")
        .isString()
        .trim()
        .escape(),
    category: body("category")
        .isMongoId()
        .withMessage("Category must be a valid ObjectId"),
};

export const createProductValidation = [
    productRules.name.notEmpty().withMessage("Name is required"),
    productRules.description.notEmpty().withMessage("Description is required"),
    productRules.price.notEmpty().withMessage("Price is required"),
    productRules.stock.notEmpty().withMessage("Stock is required"),
    productRules.image.notEmpty().withMessage("Image is required"),
    productRules.category.notEmpty().withMessage("Category id is required"),
];

export const updateProductValidation = [
    productRules.name.optional(),
    productRules.description.optional(),
    productRules.price.optional(),
    productRules.stock.optional(),
    productRules.image.optional(),
    productRules.category.optional(),

    body().custom((_, { req }) => {
        if (Object.keys(req.body).length === 0)
            throw new Error("No Data Provided, at least one field is required");
        return true;
    }),
];