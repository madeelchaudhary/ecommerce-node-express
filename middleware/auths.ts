import { Request, Response, NextFunction } from "express";

export function isAuth(req: Request, res: Response, next: NextFunction) {
  const { isAuthenticated, user } = req.session;
  if (!user || !isAuthenticated) {
    return res.redirect("/login");
  }

  next();
}

export function notAuth(req: Request, res: Response, next: NextFunction) {
  const { isAuthenticated, user } = req.session;
  if (user || isAuthenticated) {
    return res.redirect("/");
  }

  next();
}

export function isAuthAdmin(req: Request, res: Response, next: NextFunction) {
  const { isAuthenticated, user } = req.session;
  if (!user || !isAuthenticated) {
    return res.redirect("/login");
  }

  if (user.role !== "Admin") {
    return res.redirect("/404");
  }

  next();
}
