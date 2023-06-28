import { NextFunction, Request, Response } from "express";
import { FieldValidationError, validationResult } from "express-validator";
import db from "../lib/db";
import { hashPassword, matchPassword } from "../lib/auth";
import sendGrid from "../lib/mail";
import tokens, { getSecret } from "../lib/tokens";

export const getLogin = (req: Request, res: Response) => {
  const loginMessage = req.flash("loginMessage");
  const signupMessage = req.flash("signupMessage");

  const message = loginMessage[0] || signupMessage[0];
  res.render("site/login", {
    pageTitle: "Login - The Crib",
    message,
    error: false,
    oldInput: {
      email: "",
      password: "",
    },
  });
};

export const postLogin = async (req: Request, res: Response) => {
  const errors = validationResult(req).array() as FieldValidationError[];
  const { email, password } = req.body;

  if (errors.length !== 0) {
    const fieldName = errors[0].path;

    return res.status(422).render("site/login", {
      pageTitle: "Login - The Crib",
      message: undefined,
      error: true,
      errorField: fieldName,
      oldInput: {
        email: email,
        password: password,
      },
    });
  }

  const user = await db.user.findFirst({ where: { email: email } });

  if (!user) {
    return res.status(422).render("site/login", {
      pageTitle: "Login - The Crib",
      message: undefined,
      error: true,
      errorField: "not-exist",
      oldInput: {
        email: email,
        password: password,
      },
    });
  }

  const doPasswordMatch = await matchPassword(password, user.password);

  if (!doPasswordMatch) {
    return res.status(422).render("site/login", {
      pageTitle: "Login - The Crib",
      message: undefined,
      error: true,
      errorField: "password",
      oldInput: {
        email: email,
        password: password,
      },
    });
  }

  req.session.user = {
    role: user.role,
    email: user.email,
    id: user.id.toString(),
  };

  req.session.isAuthenticated = true;
  req.session.save(() => {
    res.redirect("/");
  });
};

export const postLogout = async (req: Request, res: Response) => {
  req.sessionStore.destroy(req.session.id, () => {
    res.redirect("/");
  });
};

export const getSignUp = (req: Request, res: Response) => {
  res.render("site/signup", {
    pageTitle: "Sign Up for Account - The Crib",
    error: false,
    oldInput: {
      email: "",
      password: "",
      fullname: "",
    },
  });
};

export const postSignUp = async (req: Request, res: Response) => {
  const errors = validationResult(req).array() as FieldValidationError[];
  const { email, password, fullname } = req.body;

  if (errors.length !== 0) {
    const fieldName = errors[0].path;

    return res.status(422).render("site/signup", {
      pageTitle: "Sign Up for Account - The Crib",
      error: true,
      errorField:
        fieldName === "email" && errors[0].msg === "exists"
          ? "exists"
          : fieldName,
      oldInput: {
        email,
        password,
        fullname,
      },
    });
  }

  const hashedPassword = await hashPassword(password);

  const result = await db.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: fullname,
      Cart: { create: {} },
    },
  });

  req.flash("loginMessage", "Login to your account!");
  res.redirect("/login");
  sendGrid
    .send({
      to: email,
      from: "adeelch30ty@gmail.com",
      subject: "Signed Up for The Crib",
      html: `<p>Your account has been created successfully</p>`,
    })
    .catch(console.error);
};

export const getReset = async (req: Request, res: Response) => {
  const secret = await getSecret;
  const csrfToken = tokens.create(secret);

  res.render("site/reset", {
    pageTitle: "Login - The Crib",
    error: false,
    message: undefined,
    csrfToken,
    oldInput: {
      email: "",
    },
  });
};

export const postReset = async (req: Request, res: Response) => {
  const secret = await getSecret;
  const csrfToken = req.body._csrfToken;

  if (!tokens.verify(secret, csrfToken)) {
    return res.status(403).send("Unauthorized");
  }

  const errors = validationResult(req).array() as FieldValidationError[];
  const { email } = req.body;
  if (errors.length !== 0) {
    const fieldName = errors[0].path;

    return res.status(422).render("site/reset", {
      pageTitle: "Sign Up for Account - The Crib",
      error: true,
      errorField: fieldName,
      oldInput: { email },
      message: undefined,
      csrfToken,
    });
  }

  const user = await db.user.findUnique({ where: { email: email } });

  if (!user) {
    return res.status(422).render("site/reset", {
      pageTitle: "Sign Up for Account - The Crib",
      error: true,
      message: undefined,
      errorField: "email",
      oldInput: { email },
      csrfToken,
    });
  }

  const uniqueToken = tokens.create(secret);
  const result = await db.user.update({
    where: { email: user.email },
    data: {
      resetToken: uniqueToken,
      resetTokenExp: new Date(Date.now() + 3600000),
    },
  });

  res.status(201).render("site/reset", {
    pageTitle: "Sign Up for Account - The Crib",
    error: false,
    message: "Check your mail to reset your password.",
    oldInput: { email },
    csrfToken: "",
  });

  sendGrid.send({
    from: "adeelch30ty@gmail.com",
    subject: "Reset Password",
    to: user.email,
    html: `
  <p>You request for password reset. If you don't requested then ignore the mail</p>
  <p>To reset your password click this link: <a href="http://${process.env.HOST}:${process.env.PORT}/new-password/${uniqueToken}" target="_blank">Reset Passowrd</a> <p>
  `,
  });
};

export const getNewPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.params.token;

  const user = await db.user.findFirst({
    where: { resetToken: { equals: token }, resetTokenExp: { gt: new Date() } },
  });

  if (!user) {
    return next();
  }

  const secret = await getSecret;
  const csrfToken = tokens.create(secret);

  res.render("site/new-password", {
    pageTitle: "Update Password - The Crib",
    csrfToken,
    token,
    error: false,
  });
};

export const postNewPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = await getSecret;
  const csrfToken = req.body._csrfToken;

  if (!tokens.verify(secret, csrfToken)) {
    return res.status(403).send("Unauthorized");
  }

  const token = req.params.token;

  const user = await db.user.findFirst({
    where: { resetToken: { equals: token }, resetTokenExp: { gt: new Date() } },
  });

  if (!user) {
    return next();
  }

  const errors = validationResult(req).array() as FieldValidationError[];
  const password = req.body.password;

  if (errors.length !== 0) {
    return res.status(422).render("site/new-password", {
      pageTitle: "Update Password - The Crib",
      error: true,
      csrfToken,
      token,
    });
  }

  const hashedPassword = await hashPassword(password);

  const result = await db.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
  });
  console.log(result);

  req.flash("loginMessage", "Your password got updated!");
  res.redirect("/login");
};
