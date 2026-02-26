import { body } from "express-validator";

export const loginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .escape()
    .notEmpty()
    .withMessage("Email must not be empty")
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({
      min: 3,
      max: 50,
    })
    .withMessage("Email must be between 3 and 50 characters long"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password must not be empty")
    .isLength({
      min: 8,
    })
    .withMessage("Password must be at least 8 characters long"),
];

export const registerValidation = [
  ...loginValidation,
  body("username")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username must not be empty")
    .isLength({
      min: 3,
      max: 20,
    })
    .withMessage("Username must be between 3 and 20 characters long"),
];
