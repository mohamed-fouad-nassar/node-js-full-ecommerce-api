import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { HttpError, catchAsync, httpStatus } from "../utils/index.js";
import {hashToken, signAccessToken, signRefreshToken} from "../services/token.service.js";

export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new HttpError(404, httpStatus.FAIL, "Invalid credentials"));

  const isValid = await user.comparePassword(password);
  if (!isValid)
    return next(new HttpError(401, httpStatus.FAIL, "Invalid credentials"));

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    status: httpStatus.SUCCESS,
    message: "User logged in successfully",
    data: {
      token: accessToken,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username,
      },
    },
  });
});

export const registerUser = catchAsync(async (req, res, next) => {
  const { email, password, username } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new HttpError(401, httpStatus.FAIL, "User already exists"));

  const user = await User.create({ email, password, username });
  if(!user) return next(new HttpError(401, httpStatus.ERROR, "Error inserting user"));

  return res.status(201).json({
    status: httpStatus.SUCCESS,
    message: "User registered successfully",
  })
});

export const logoutUser = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if(!token)
    return next(new HttpError(401, httpStatus.FAIL, "You need to login first"));

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.log(error);
    next(new HttpError(401, httpStatus.ERROR, "Error in token"));
  }

  if (payload?.id) {
    await User.findByIdAndUpdate(payload.id, { refreshToken: null });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.sendStatus(204);
})

export const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if(!token)
    return next(new HttpError(401, httpStatus.FAIL, "You need to login first"));

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.log(error);
    return next(new HttpError(401, httpStatus.ERROR, "Error in refresh token"));
  }

  const user = await User.findById(payload.id);
  if(!user)
    return next(new HttpError(401, httpStatus.FAIL, "Invalid refresh token"));

  const hashedIncoming = hashToken(token);
  if (hashedIncoming !== user.refreshToken)
    return next(new HttpError(401, httpStatus.FAIL, "Token reuse detected"));

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: httpStatus.SUCCESS,
    message: "Token has updated been successfully",
    data: {
      token: accessToken,
    }
  });
});