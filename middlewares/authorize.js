import jwt from "jsonwebtoken";
import { httpStatus } from "../utils/index.js";

export default (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if(!authorization)
            return res.status(401).json({status: httpStatus.FAIL, message: "No token provided"});

        const token = authorization.split(" ")[1];
        if(!token)
            return res.status(401).json({status: httpStatus.FAIL, message: "No token provided"});

        const user = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        req.userId = user.id;
        req.userRole = user.role;

        next();
    } catch (err) {
        return res.status(401).json({status: httpStatus.ERROR, message: "Error in authentication, Invalid token"});
    }
}