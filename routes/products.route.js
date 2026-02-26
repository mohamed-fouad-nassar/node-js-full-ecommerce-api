import {Router} from "express";
import {
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts,
    createNewProduct,
} from "../controllers/products.controller.js";
import {authorize, strict, validate} from "../middlewares/index.js";
import {validateObjectIdParamValidation} from "../validations/objectId.validation.js";
import {createProductValidation, updateProductValidation} from "../validations/product.validation.js";

const router = Router();

router.use(authorize);

router.route('/')
    .get(getAllProducts)
    .post(strict("admin"), createProductValidation, validate, createNewProduct)

router.route('/:id')
    .all(validateObjectIdParamValidation("id"), authorize)
    .get(getProductById)
    .patch(strict("admin"), updateProductValidation, validate, updateProduct)
    .delete(strict("admin"), deleteProduct)

export default router;