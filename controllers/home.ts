import { Request, Response } from "express";
import db from "../lib/db";

export const getHomePage = async (req: Request, res: Response) => {
  const prods = await db.product.findMany({
    take: 3,
    orderBy: { created_at: "desc" },
    select: { title: true, image: true, price: true, slug: true, label: true },
    where: { label: "Featured" },
  });

  res.render("index", {
    pageTitle: "Top Quality Furniture - The Crib",
    products: prods,
  });
};
