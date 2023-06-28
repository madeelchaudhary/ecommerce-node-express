import { NextFunction, Request, Response } from "express";
import db from "../lib/db";
import { Product } from "../types/shop";
import tokens, { getSecret } from "../lib/tokens";
import { FieldValidationError, validationResult } from "express-validator";
import path from "path";
import { rootPath } from "../lib/paths";

export const getAdmin = (req: Request, res: Response) => {
  res.redirect("/admin/products");
};

export const getAddProduct = async (req: Request, res: Response) => {
  const secret = await getSecret;
  const csrfToken = tokens.create(secret);

  const categories = await db.category.findMany();
  res.render("admin/product-form", {
    pageTitle: "Add New Product",
    categories,
    editMode: false,
    csrfToken,
    error: undefined,
  });
};

export const postAddProduct = async (req: Request, res: Response) => {
  const secret = await getSecret;
  const csrfToken = req.body._csrfToken;

  if (!tokens.verify(secret, csrfToken)) {
    return res.status(403).send("Unauthorized");
  }

  const errors = validationResult(req).array() as FieldValidationError[];
  const { title, description, price, brand, label, category } =
    req.body as Product;
  const image = req.file?.path;

  const categories = await db.category.findMany();
  const categoryExist = categories.find((ele) => ele.id === +category);

  if (errors.length !== 0 || !categoryExist || !image) {
    let errorDetails = errors[0];
    if (!categoryExist) {
      errorDetails = { msg: "Category Not Exist", path: "Category" } as any;
    }

    if (!image) {
      errorDetails = { msg: "Image cannot be processed", path: "Image" } as any;
    }

    return res.status(422).render("admin/product-form.ejs", {
      pageTitle: "Add New Product",
      error: {
        msg: errorDetails.msg,
        field: `Error on ${errorDetails.path}`,
      },
      csrfToken,
      categories,
      editMode: false,
      prod: {
        title,
        description,
        price,
        brand,
        label,
        category: {
          id: +category,
        },
      },
    });
  }

  const productSlug = title.toLowerCase().replace(/ /g, "-");
  const userId = req.session.user!.id;

  const result = await db.product.create({
    data: {
      title,
      description,
      image,
      price,
      label,
      slug: productSlug,
      brand,
      User: { connect: { id: +userId } },
      category: { connect: { id: +category } },
    },
  });

  res.redirect("/admin/products");
};

export const getAdminProducts = async (req: Request, res: Response) => {
  const userId = req.session.user!.id;
  const prods = await db.product.findMany({
    take: 5,
    where: { User: { id: +userId } },
    select: {
      id: true,
      title: true,
      created_at: true,
      category: { select: { name: true } },
      label: true,
    },
  });

  res.render("admin/products", {
    pageTitle: "Products - Admin",
    products: prods,
  });
};

export const getEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.params.prodId;
  if (!req.query.edit) {
    return next();
  }

  const userId = req.session.user!.id;
  const prod = await db.product.findFirst({
    where: { id: prodId, User: { id: +userId } },
    include: { category: true },
  });
  if (!prod) {
    return next();
  }

  const secret = await getSecret;
  const csrfToken = tokens.create(secret);
  const categories = await db.category.findMany();

  res.render("admin/product-form", {
    pageTitle: `Edit: ${prod.title}`,
    categories,
    prod,
    error: undefined,
    editMode: true,
    csrfToken,
  });
};

export const postEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = await getSecret;
  const csrfToken = req.body._csrfToken;

  if (!tokens.verify(secret, csrfToken)) {
    return res.status(403).send("Unauthorized");
  }

  const productId = req.body.productId;
  const userId = req.session.user!.id;
  const prod = await db.product.findFirst({
    where: { id: productId, User: { id: +userId } },
  });

  if (!prod) {
    return next();
  }

  //

  const errors = validationResult(req).array() as FieldValidationError[];
  const { title, description, price, brand, label, category } =
    req.body as Product;
  const categories = await db.category.findMany();
  const categoryExist = categories.find((ele) => ele.id === +category);

  if (errors.length !== 0 || !categoryExist) {
    console.log(errors, title, "there is an error");
    let errorDetails = errors[0];
    if (!categoryExist) {
      errorDetails = { msg: "Category Not Exist", path: "Category" } as any;
    }

    return res.status(422).render("admin/product-form.ejs", {
      pageTitle: "Add New Product",
      error: {
        msg: errorDetails.msg,
        field: `Error on ${errorDetails.path}`,
      },
      csrfToken,
      categories,
      editMode: true,
      prod: {
        title,
        description,
        price,
        brand,
        label,
        category: {
          id: +category,
        },
      },
    });
  }
  //

  const image = req.file?.path;
  const productSlug = title.toLowerCase().replace(/ /g, "-");
  const result = await db.product.update({
    where: { id: prod.id },
    data: {
      brand,
      categoryId: +category,
      description,
      image,
      title,
      slug: productSlug,
      price,
      label,
    },
  });

  res.redirect("/admin/products");
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.session.user!.id;
  const productId = req.params.prodId;

  const prod = await db.product.findFirst({
    where: { id: productId, User: { id: +userId } },
  });
  if (!prod) {
    return next();
  }

  const result = await db.product.delete({ where: { id: prod.id } });
  res.json({ error: null, message: "Delete Product Successfully!" });
};

export const getInvoice = (req: Request, res: Response, next: NextFunction) => {
  const fileName = path.join(rootPath, "data", "invoices", "dummy.pdf");
  res.sendFile(fileName, (err) => {
    if (err) {
      next(err);
    }
  });
};
