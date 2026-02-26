import {Product} from "../models/index.js";
import {catchAsync, filterObject, HttpError, httpStatus} from "../utils/index.js";

export const getAllProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find();
    return res.json({
        status: httpStatus.SUCCESS,
        data: products
    });
});

export const createNewProduct = catchAsync(async (req, res, next) => {
    const {name, description, image, price, stock, category} = req.body;

    const product = await Product.create({name, description, image, price, stock, category});
    if(!product) return next(401, httpStatus.FAIL, "Error inserting product");

    return res.status(201).json({
        status: httpStatus.SUCCESS,
        message: "Product created successfully",
        data: product,
    })
});

export const getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await  Product.findById(id);
    if(!product) return next(new HttpError(404, httpStatus.FAIL, "Product not found"));

    return res.json({
        status: httpStatus.SUCCESS,
        data: product,
    })
});

export const updateProduct = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const allowedFields = ["name", "description", "price", "stock", "image", "category"];
    const data = filterObject(req.body, allowedFields);

    const product = await Product.findByIdAndUpdate(id, data, {runValidators: true, new: true});
    if(!product) return next(new HttpError(404, httpStatus.FAIL, "Product not found"));

    return res.json({
        status: httpStatus.SUCCESS,
        message: "Product updated successfully",
        data: product,
    });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if(!product) return next(new HttpError(404, httpStatus.FAIL, "Product not found"));

    return res.json({
        status: httpStatus.SUCCESS,
        message: "Product deleted successfully",
    })
});
