import {startSession} from "mongoose";
import {Order, Product} from '../models/index.js';
import {catchAsync, HttpError, httpStatus} from "../utils/index.js";

const cancelOrder = async (order, session) => {
    if(order.status === 'cancelled')
        throw new HttpError(400, httpStatus.FAIL, "Order is already cancelled, you can't activate it again");

    if(order.status === 'delivered')
        throw new HttpError(400, httpStatus.FAIL, "Order is already delivered, you can't update status again");

    for(const item of order.items) {
        const product = await Product.findById(item.productId).session(session);
        if(!product)
            throw new HttpError(404, httpStatus.FAIL, "Product not found");

        product.stock += item.qty;
        await product.save({session});
    }
    order.status = "cancelled";
    await order.save({ session });
    return order;
};

export const getAllOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find();
    return res.json({
        status: httpStatus.SUCCESS,
        data: orders
    });
});

export const getUserOrdersById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const orders = await Order.find({user: id}).populate({
        path: 'user',
        select: '-password -refreshToken',
    });
    if (!orders)
        return next(new HttpError(404, httpStatus.FAIL, "User have no orders yet."));

    return res.json({
        status: httpStatus.SUCCESS,
        data: orders
    });
});

export const getCurrentUserOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({user: req.userId});
    if (!orders)
        return next(new HttpError(404, httpStatus.FAIL, "User have no orders yet."));

    return res.json({
        status: httpStatus.SUCCESS,
        data: orders
    });
});

export const getCurrentUserOrderById = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const order = await Order.findById(id)
    if (!order)
        return next(new HttpError(404, httpStatus.FAIL, "Order not found"));

    if(order.user != req.userId)
        return next(new HttpError(403, httpStatus.FAIL, "You don't have permission to access this order"));

    return res.json({
        status: httpStatus.SUCCESS,
        data: order
    });
});

export const createUserOrder = catchAsync(async (req, res, next) => {
    const {items, discount = 0} = req.body;
    const session = await startSession();
    session.startTransaction();
    try {
        let orderItems = [], subtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product)
                return next(new HttpError(404, httpStatus.FAIL, "Product not found"));
            if(product.stock < item.qty)
                return next(new HttpError(400, httpStatus.FAIL,`Insufficient stock for ${product.name}`));

            const price = product.price;
            subtotal += price * item.qty;
            orderItems.push({
                productId: product._id,
                qty: item.qty,
                price
            });
            product.stock -= item.qty;
            await product.save({ session });
        }

        const total = subtotal - discount;

        const order = await Order.create([{
            total,
            discount,
            subtotal,
            user: req.userId,
            items: orderItems,
        }], {session})

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            status: httpStatus.SUCCESS,
            message: "Order created successfully",
            data: order[0]
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return next(err);
    }
});

export const updateUserOrder = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const {status} = req.body;
    const session = await startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(id).session(session);
        if (!order)
            throw new HttpError(404, httpStatus.FAIL, "Order not found");

        if (order.status === status)
            throw new HttpError(400, httpStatus.FAIL, `order status is already ${order.status}`);

        if(status === "cancelled")
            await cancelOrder(order, session);
        else {
            order.status = status;
            await order.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            status: httpStatus.SUCCESS,
            data: order,
            message: "Order updated successfully",
        })
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
});

export const cancelUserOrder = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const session = await startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(id).session(session);
        if (!order)
            throw new HttpError(404, httpStatus.FAIL, "Order not found");

        await  cancelOrder(order, session);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            status: httpStatus.SUCCESS,
            data: order,
            message: "Order updated successfully",
        })
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
});
