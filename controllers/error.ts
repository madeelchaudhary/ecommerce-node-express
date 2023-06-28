import { ErrorRequestHandler, Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).render("404", { pageTitle: "404 - Page Not Found" });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).render("500", { pageTitle: "Internal Server Error." });
};
