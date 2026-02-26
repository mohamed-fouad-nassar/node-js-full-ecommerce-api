import { httpStatus } from "../utils/index.js";

export default (err, _, res, __) => {
    console.log(err);
    return res.status(err.code || 500).json({
        status: err.status || httpStatus.ERROR,
        message: err.message || "Internal Server Error",
    });
}