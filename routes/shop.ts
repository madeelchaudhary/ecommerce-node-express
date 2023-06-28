import { Router } from "express";
import {
  addToCart,
  deleteFromCart,
  getCart,
  getCheckout,
  getOrders,
  getProduct,
  getProducts,
  postCheckout,
} from "../controllers/shop";
import { isAuth } from "../middleware/auths";

const router = Router();

router.get("/shop", getProducts);

router.get("/shop/:slug", getProduct);

router.get("/cart", isAuth, getCart);

router.post("/add-to-cart/:prodId", isAuth, addToCart);

router.delete("/cart/:prodId", isAuth, deleteFromCart);

router.get("/checkout", isAuth, getCheckout);

router.post("/checkout", isAuth, postCheckout);

router.get("/orders", isAuth, getOrders);

export default router;
