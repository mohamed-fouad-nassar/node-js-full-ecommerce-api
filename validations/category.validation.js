import  {body} from "express-validator";

const categoryRules = {
    name: body('name')

            .trim()
            .escape()
            .isLength({min: 3, max: 20})
            .withMessage("Name must be between 3 and 20 characters long"),
    description: body('description')
            .trim()
            .escape()
            .isLength({min: 3, max: 400})
            .withMessage("Description must be between 3 and 400 characters long")
}

export const createCategoryValidation = [
    categoryRules.name.notEmpty().withMessage("Name is required"),
    categoryRules.description.notEmpty().withMessage("Description is required"),
]

export const updateCategoryValidation = [
    categoryRules.name.optional(),
    categoryRules.description.optional(),

    body().custom((value, { req }) => {
        if (Object.keys(req.body).length === 0) {
            throw new Error("No Data Provided, at least one field is required");
        }
        return true;
    }),
]