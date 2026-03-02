import {Router} from "express";
import {
    clearCart,
    addCartItem,
    decreaseQty,
    getAllCarts,
    removeCartItem,
    updateCartItem,
    getCartByUserId,
    getCurrentUserCart,
} from "../controllers/cart.controller.js";
import {authorize, strict, validate} from "../middlewares/index.js";
import {validateObjectIdParamValidation} from "../validations/objectId.validation.js";
import {cartDetailsValidation, cartProductIdValidation} from "../validations/cart.validation.js";

const router = Router();

router.use(authorize);

router.route("/items")
    .post(cartDetailsValidation, validate, addCartItem)
    .patch(cartDetailsValidation, validate, updateCartItem)
    .delete(cartProductIdValidation, validate, removeCartItem)

router.post("/items/decrease", cartDetailsValidation, validate, decreaseQty);

router.route("/")
    .get(getCurrentUserCart)
    .delete(clearCart);

router.get('/admin', strict('admin'), getAllCarts);
router.get('/admin/:id',validateObjectIdParamValidation("id"), validate, strict("admin"), getCartByUserId);

export default router;
