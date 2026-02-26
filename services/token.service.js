import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signAccessToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY }
    );

export const signRefreshToken = (user) =>
    jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY }
    );

export const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");