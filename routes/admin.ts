import { Router } from "express";
import {
  deleteProduct,
  getAddProduct,
  getAdmin,
  getAdminProducts,
  getEditProduct,
  getInvoice,
  postAddProduct,
  postEditProduct,
} from "../controllers/admin";
import { isAuthAdmin } from "../middleware/auths";
import { body } from "express-validator";
import db from "../lib/db";
import { ProductLabel } from "@prisma/client";

const router = Router();

router.use("/", isAuthAdmin);

router.get("/", getAdmin);

router.get("/add-product", getAddProduct);

router.post(
  "/add-product",
  body("title")
    .trim()
    .isLength({ min: 5, max: 125 })
    .custom(async (value, { req }) => {
      const result = await db.product.findFirst({
        where: { title: { equals: value } },
      });
      if (result) {
        return Promise.reject("Product with same title exists!");
      }
    }),
  body("price").trim().isFloat({ gt: 0 }),
  body("category").trim().isInt({ gt: 0 }),
  body("brand").trim().isString().isLength({ min: 3, max: 125 }),
  body("label")
    .trim()
    .custom((value, { req }) => {
      if (value !== ProductLabel.Featured && value !== ProductLabel.New) {
        throw new Error("Label is not recogized!");
      }
      return true;
    }),
  body("description").trim().isString().isLength({ min: 50, max: 750 }),
  postAddProduct
);

router.get("/products", getAdminProducts);

router.get("/products/:prodId", getEditProduct);

router.post(
  "/products/:prodId",
  body("title")
    .trim()
    .isLength({ min: 5, max: 125 })
    .custom(async (value, { req }) => {
      const result = await db.product.findFirst({
        where: { title: value },
      });

      if (result && result.id !== req.params!.prodId) {
        return Promise.reject("Product with same title exists!");
      }
    }),
  body("price").trim().isFloat({ gt: 0 }),
  body("category").trim().isInt({ gt: 0 }),
  body("brand").trim().isString().isLength({ min: 3, max: 125 }),
  body("label")
    .trim()
    .custom((value, { req }) => {
      if (value !== ProductLabel.Featured && value !== ProductLabel.New) {
        throw new Error("Label is not recogized!");
      }
      return true;
    }),
  body("description").trim().isString().isLength({ min: 50, max: 750 }),
  postEditProduct
);

router.delete("/products/:prodId", deleteProduct);

router.get("/invoice", getInvoice);

export default router;
