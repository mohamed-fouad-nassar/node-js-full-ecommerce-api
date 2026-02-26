import { httpStatus } from "../utils/index.js";

export default (_, res) => res.status(404).json({ status: httpStatus.FAIL, message: "Route Not Found" });
