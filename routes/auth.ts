import { Router } from "express";
import {
  getLogin,
  getNewPassword,
  getReset,
  getSignUp,
  postLogin,
  postLogout,
  postNewPassword,
  postReset,
  postSignUp,
} from "../controllers/auth";
import { isAuth, notAuth } from "../middleware/auths";
import { body } from "express-validator";
import db from "../lib/db";

const router = Router();

router.get("/login", notAuth, getLogin);

router.post(
  "/login",
  notAuth,
  body("email").isEmail(),
  body("password").isLength({ min: 1 }),
  postLogin
);

router.post("/logout", isAuth, postLogout);

router.get("/signup", notAuth, getSignUp);

router.post(
  "/signup",
  notAuth,
  body("email")
    .isEmail()
    .custom(async (value, { path }) => {
      const user = await db.user.findFirst({
        where: { email: { equals: value } },
      });

      if (user) {
        path = "exists";

        return Promise.reject("exists");
      }
    }),
  body("password")
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
      minLowercase: 1,
    })
    .isLength({ max: 16 }),
  postSignUp
);

router.get("/reset", getReset);

router.post("/reset", body("email").isEmail(), postReset);

router.get("/new-password/:token", getNewPassword);

router.post(
  "/new-password/:token",
  body("password")
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
      minLowercase: 1,
    })
    .isLength({ max: 16 }),
  postNewPassword
);

export default router;
