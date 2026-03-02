import {Cart, Product} from "../models/index.js";
import {catchAsync, HttpError, httpStatus} from "../utils/index.js";

export const getAllCarts = catchAsync(async (req, res, next) => {
    const carts = await Cart.find();
    return res.json({
        status: httpStatus.SUCCESS,
        data: carts
    });
});

export const getCartByUserId = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const cart = await Cart.findOne({user: id}).populate("user");
    if (!cart)
        return next(new HttpError(404, httpStatus.FAIL, "Cart not found"))

    return res.json({
        status: httpStatus.SUCCESS,
        data: cart
    })
});

export const getCurrentUserCart = catchAsync(async (req, res, next) => {
    const { expand } = req.query;

    let query = Cart.findOne({user: req.userId});
    if(expand === 'products') query = query.populate("items.productId");
    const cart = await query;
    if (!cart)
        return next(new HttpError(404, httpStatus.FAIL, "Cart not found"))

    return res.json({
        status: httpStatus.SUCCESS,
        data: cart
    })
});

export const addCartItem = catchAsync(async (req, res, next) => {
    const { productId, qty } = req.body;

    const product = await Product.findById(productId);
    if(!product)
        return next(new HttpError(404, httpStatus.FAIL, "Product not found"));
    if(product.stock < qty)
        return next(new HttpError(400, httpStatus.FAIL, "Product stock exceeded"));

    let cart = await Cart.findOne({user: req.userId});
    if (!cart)
        cart = await Cart.create({user: req.userId, items: []});

    const existingCartItem = cart.items.find((item) => item.productId.equals(productId));
    if (existingCartItem) {
        if (existingCartItem.qty + +qty > product.stock)
            return next(new HttpError(400, httpStatus.FAIL, "Product stock exceeded"));
        existingCartItem.qty += +qty;
    }
    else
        cart.items.push({productId, qty});

    await cart.save();
    return res.status(201).json({
        status: httpStatus.SUCCESS,
        message: "Product added successfully",
        data: cart
    })
});

export const decreaseQty = catchAsync(async (req, res, next) => {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({user: req.userId});
    if (!cart)
        return next(new HttpError(404, httpStatus.FAIL, "Cart not found"));

    const existingItem = cart.items.find((item) => item.productId.equals(productId));
    if (!existingItem)
        return next(new HttpError(404, httpStatus.FAIL, "Product not in cart"));

    if(existingItem.qty - qty <= 0)
        cart.items = cart.items.filter((item) => !item.productId.equals(productId));
    else
        existingItem.qty -= qty;
    await cart.save();

    return res.json({
        status: httpStatus.SUCCESS,
        message: "Cart item quantity decreased successfully",
        data: cart
    });
});

export const updateCartItem = catchAsync(async (req, res, next) => {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({user: req.userId});
    if (!cart)
        return next(new HttpError(404, httpStatus.FAIL, "Cart not found"));

    const existingItem = cart.items.find((item) => item.productId.equals(productId));
    if (!existingItem)
        return next(new HttpError(404, httpStatus.FAIL, "Product not in cart"));

    existingItem.qty = qty;
    await cart.save();

    return res.json({
        status: httpStatus.SUCCESS,
        message: "Cart updated successfully",
        data: cart
    });
});

export const removeCartItem = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    const cart = await Cart.findOne({user: req.userId});
    if (!cart)
        return next(new HttpError(404, httpStatus.FAIL, "Cart not found"));

    const itemExists = cart.items.some((item) => item.productId.equals(productId));
    if (!itemExists)
        return next(new HttpError(404, httpStatus.FAIL, "Product not in cart"));

    cart.items = cart.items.filter((item) => !item.productId.equals(productId));
    await cart.save();

    return res.json({
        status: httpStatus.SUCCESS,
        message: "Cart item removed successfully",
        data: cart
    });
});

export const clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({user: req.userId});
    if (!cart)
        return next(new HttpError(404, httpStatus.FAIL, "Cart not found"));

    cart.items = [];
    await cart.save();

    return res.json({
        status: httpStatus.SUCCESS,
        message: "Cart cleared successfully",
        data: cart
    });
});