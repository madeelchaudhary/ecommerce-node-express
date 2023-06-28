import { NextFunction, Request, Response } from "express";
import db from "../lib/db";
import { Decimal } from "@prisma/client/runtime";
import Stripe from "stripe";

const ITEMS_PER_PAGE = 3;

export const getProducts = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;

  const totalProducts = await db.product.count();

  const prods = await db.product.findMany({
    orderBy: { created_at: "desc" },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    select: { title: true, image: true, price: true, slug: true, label: true },
  });

  res.render("shop/index", {
    pageTitle: "Shop - The Crib",
    products: prods,
    hasNextPage: page * ITEMS_PER_PAGE < totalProducts,
    hasPreviousPage: page > 1,
    currentPage: page,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
  });
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productSlug = req.params.slug;

  const prod = await db.product.findUnique({
    where: { slug: productSlug },
    include: { category: true },
  });

  if (!prod) {
    return next();
  }

  res.render("shop/product-detail", {
    pageTitle: prod.title,
    product: prod,
    isAuthenticated: req.session.isAuthenticated,
  });
};

export const getCart = async (req: Request, res: Response) => {
  const cart = await db.cart.findUnique({
    where: { userId: +req.session.user!.id },
    include: {
      products: {
        include: {
          Product: {
            select: {
              title: true,
              image: true,
              price: true,
              brand: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  let totalPrice = 0;
  let cartProducts:
    | []
    | {
        qty: number;
        title: string;
        image: string;
        price: Decimal;
        slug: string;
        brand: string;
      }[];

  if (!cart || cart.products.length === 0) {
    cartProducts = [];
  } else {
    cartProducts = cart.products.map((prodData) => {
      totalPrice +=
        prodData.qty * (prodData.Product.price as unknown as number);
      const prod = {
        ...prodData.Product,
        qty: prodData.qty,
      };
      return prod;
    });
  }

  res.render("shop/cart", {
    pageTitle: "Cart - The Crib",
    cartProducts,
    totalPrice: totalPrice.toFixed(2),
  });
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.params.prodId;
  const userId = req.session.user!.id;
  const existingItem = await db.cartItem.findFirst({
    where: {
      Product: { id: { equals: prodId } },
      Cart: { userId: { equals: +userId } },
    },
  });

  if (existingItem) {
    await db.cartItem.update({
      where: {
        productId_cartId: {
          cartId: existingItem.cartId,
          productId: existingItem.productId,
        },
      },
      data: { qty: existingItem.qty + 1 },
    });
    return res.redirect("/cart");
  }

  const prod = db.product.findUnique({ where: { id: prodId } });

  if (!prod) {
    return next();
  }

  const result = await db.cartItem.create({
    data: {
      qty: 1,
      Product: { connect: { id: prodId } },
      Cart: { connect: { userId: +userId } },
    },
  });

  res.redirect("/cart");
};

export const deleteFromCart = (req: Request, res: Response) => {};

export const getCheckout = async (req: Request, res: Response) => {
  const stripe = new Stripe(process.env.STRIPE_SK!, {
    apiVersion: "2022-11-15",
  });

  const shipRates = await stripe.shippingRates.list({ active: true });

  const paymentIntent = await stripe.paymentIntents.create({
    automatic_payment_methods: {
      enabled: true,
    },
    amount: 1000,
    currency: "usd",
  });

  res.render("shop/checkout", {
    pageTitle: "Checkout - The Crib",
    clientSecret: paymentIntent.client_secret,
    publicKey: process.env.STRIPE_PK,
  });
};

export const postCheckout = (req: Request, res: Response) => {};

export const getOrders = (req: Request, res: Response) => {};
