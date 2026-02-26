import { Router } from "express";
import {
    updateCategory,
    deleteCategory,
    getCategoryById,
    getAllCategories,
    createNewCategory,
    getCategoryProducts,
} from "../controllers/categories.controller.js";
import {authorize, strict, validate} from "../middlewares/index.js";
import {validateObjectIdParamValidation} from "../validations/objectId.validation.js";
import {createCategoryValidation, updateCategoryValidation} from "../validations/category.validation.js";

const router = Router();

router.use(authorize);

router.route("/")
    .get(getAllCategories)
    .post(strict("admin"), createCategoryValidation, validate ,createNewCategory);

router.route("/:id")
    .all(validateObjectIdParamValidation("id"), validate)
    .get(getCategoryById)
    .patch(strict("admin"), updateCategoryValidation, validate, updateCategory)
    .delete(strict("admin"), deleteCategory);

router.route("/:id/products").get(validateObjectIdParamValidation("id"), validate, getCategoryProducts);

export default router;