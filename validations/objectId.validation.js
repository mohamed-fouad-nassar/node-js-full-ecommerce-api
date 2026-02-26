import { param } from "express-validator";

export const validateObjectIdParamValidation = (fieldName) => [
    param(fieldName)
        .isMongoId()
        .withMessage(`${fieldName} must be a valid MongoDB ObjectId`),
];