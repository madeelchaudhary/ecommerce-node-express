import { Router, urlencoded } from "express";
import multer, { FileFilterCallback } from "multer";
import { Options } from "multer";
import adminRoutes from "./admin";
import shopRoutes from "./shop";
import siteRoutes from "./site";
import authRoutes from "./auth";
import { errorHandler, notFound } from "../controllers/error";
import { getHomePage } from "../controllers/home";

const router = Router();

const fileFilter: Options["fileFilter"] = (
  req,
  file,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    return cb(null, true);
  }

  cb(new Error("File not supported. Select a valid Image"));
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "data/images");
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

router.use(urlencoded({ extended: false }));

router.use(
  multer({ limits: { fileSize: 1048576 }, fileFilter, storage }).single("image")
);

router.use("/admin", adminRoutes);

router.use(shopRoutes);

router.use(siteRoutes);

router.use(authRoutes);

router.get("/", getHomePage);

router.use(notFound);

router.use(errorHandler);

export default router;
