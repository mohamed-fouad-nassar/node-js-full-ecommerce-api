import {Category} from "../models/index.js";
import {catchAsync, filterObject, HttpError, httpStatus} from "../utils/index.js";

export const getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find();
    return res.json({
        status: httpStatus.SUCCESS,
        data: categories,
    })
})

export const createNewCategory = catchAsync(async (req, res, next) => {
    const {name, description} = req.body;

    const existingCategory = await Category.findOne({name});
    if(existingCategory) return next(new HttpError(401, httpStatus.FAIL, "Category is already exists"));

    const category = await Category.create({name, description});
    if(!category) return next(401, httpStatus.FAIL, "Error inserting category");

    return res.status(201).json({
        status: httpStatus.SUCCESS,
        message: "Category created successfully",
        data: category,
    })
})

export const updateCategory = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const allowedFields = ["name", "description"];
    const data = filterObject(req.body, allowedFields);

    const category = await Category.findByIdAndUpdate(id, data, {new: true, runValidators: true});
    if(!category) return next(new HttpError(404, httpStatus.FAIL, "Category not found"));

    return res.json({
        status: httpStatus.SUCCESS,
        message: "Category updated successfully",
        data: category,
    });
})

export const deleteCategory = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const category = await  Category.findById(id);
    if(!category) return next(new HttpError(4044, httpStatus.FAIL, "Category Not Found"));

    // if there is products in this category stop deleting

    await Category.deleteOne({_id: category._id})
    return res.json({
        status: httpStatus.SUCCESS,
        message: "Category deleted successfully"
    })
})

export const getCategoryById = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const category = await Category.findById(id);
    if(!category) return next(new HttpError(404, httpStatus.FAIL, "Category not found"));

    return res.json({
        status: httpStatus.SUCCESS,
        data: category,
    })
})

export const getCategoryProducts = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const category = await Category.findById(id);
    if(!category) return next(new HttpError(404, httpStatus.FAIL, "Category not found"));

    // GET products from db with {categoryId = category._id)
    const products = [];
    return  res.json({
        status: httpStatus.SUCCESS,
        data: products,
    });
})
