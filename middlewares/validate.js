import { httpStatus } from "../utils/index.js";
import { validationResult } from "express-validator";

export default (req, res, next) => {
  const errors = validationResult(req);
  // console.log("BODY:", req.body);

  if (errors.isEmpty()) return next();
  else {
    // console.log("ERRORS:", errors.array());
    return res.status(400).json({
      status: httpStatus.ERROR,
      message: "Data Validation Error",
      data: { errors: errors.array().map((err) => err.msg) },
    });
  }
};
