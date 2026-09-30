import cors from "cors";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";
import { readFileSync } from "node:fs";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";

import { notFound, error } from "./middlewares/index.js";
import {authRoute, cartRoute, categoriesRoute, productsRoute, ordersRoute} from "./routes/index.js";

const app = express();

const openapiDocument = YAML.parse(
  readFileSync(new URL("./docs/openapi.yaml", import.meta.url), "utf8"),
);

// Default Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Swagger UI
app.get("/api-docs/openapi.json", (_req, res) => res.json(openapiDocument));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument, {
    customSiteTitle: "E-commerce API Docs",
    swaggerOptions: { persistAuthorization: true },
  }),
);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/products", productsRoute);
app.use("/api/categories", categoriesRoute);

// Error and Not Found Middlewares
app.use(notFound);
app.use(error);

export default app;
