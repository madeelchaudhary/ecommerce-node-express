import { Request, Response } from "express";

export const getContact = (req: Request, res: Response) => {
  res.render("site/contact", {
    pageTitle: "Contact - The Crib",
    isAuthenticated: req.session.isAuthenticated,
  });
};
