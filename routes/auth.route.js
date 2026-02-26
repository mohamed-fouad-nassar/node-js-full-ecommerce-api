import { Router } from "express";
import {
  loginValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import { validate, authorize } from "../middlewares/index.js";
import { loginUser, registerUser, refreshToken ,logoutUser} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", loginValidation, validate, loginUser);
router.post("/register", registerValidation, validate, registerUser);
router.post("/refresh", refreshToken);
router.post("/logout", authorize, logoutUser)

export default router;
