import { httpStatus, HttpError } from "../utils/index.js";

export default (Model, ownerField = "user") => {
    return async (req, res, next) => {
        const { id } = req.params;

        const resource = await Model.findById(id);
        if (!resource)
            return next(new HttpError(404, httpStatus.FAIL, "Resource not found"));

        if (req.user.role === "admin") {
            req.resource = resource;
            return next();
        }

        if (resource[ownerField].toString() !== req.user.id)
            return next(new HttpError(403, httpStatus.FAIL, "You are not allowed to access this resource"));

        req.resource = resource;
        next();
    };
};