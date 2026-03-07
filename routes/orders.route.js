import {Router} from "express";
import {
    getAllOrders,
    createUserOrder,
    updateUserOrder,
    cancelUserOrder,
    getUserOrdersById,
    getCurrentUserOrders,
    getCurrentUserOrderById,
} from "../controllers/orders.contoller.js";
import {authorize, strict, validate} from "../middlewares/index.js";
import {validateObjectIdParamValidation} from "../validations/objectId.validation.js";
import {createOrderValidation, updateOrderValidation} from "../validations/order.validation.js";

const router = Router()

router.use(authorize);

router.route("/")
    .get(getCurrentUserOrders)
    .post(createOrderValidation, validate, createUserOrder)

router.get("/admin", strict("admin"), getAllOrders);

router.route("/:id")
    .all(validateObjectIdParamValidation("id"), validate)
    .get(getCurrentUserOrderById)
    .patch(strict("admin"), updateOrderValidation, validate, updateUserOrder)

router.get("/admin/:id", strict("admin"), validateObjectIdParamValidation("id"), validate, getUserOrdersById);

router.patch('/:id/cancel', validateObjectIdParamValidation("id"), validate, cancelUserOrder)

export default router;