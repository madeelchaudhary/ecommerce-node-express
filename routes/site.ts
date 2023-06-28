import { Router } from "express";
import { getContact } from "../controllers/site";

const router = Router();

router.get("/contact", getContact);

export default router;
