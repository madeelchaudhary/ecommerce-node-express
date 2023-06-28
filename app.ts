import express from "express";
import { config } from "dotenv";
import routes from "./routes/routes";
import path from "path";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import session from "express-session";
import flash from "connect-flash";

config();

const PORT = +process.env.PORT!;
const HOST = process.env.HOST!;
const redisClient = createClient({
  password: "MPe3Q1pSAEkhRMqe9Z8hYIxiipeCvdLP",
  socket: {
    host: "redis-19772.c239.us-east-1-2.ec2.cloud.redislabs.com",
    port: 19772,
  },
});

declare module "express-session" {
  interface SessionData {
    user: {
      id: string;
      email: string;
      role: "Admin" | "Visitor";
    };
    isAuthenticated: boolean;
  }
}

redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "shop",
  ttl: 86400000,
  disableTouch: false,
});
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use("/data/images", express.static(path.join(__dirname, "data", "images")));
app.use(
  session({
    secret: "my secret cookie",
    saveUninitialized: false,
    resave: false,
    store: redisStore as any,
    cookie: { maxAge: 86400000 },
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  next();
});
app.use(routes);

app.listen(PORT, HOST, () => {
  console.log(`App running at http://${HOST}:${PORT}`);
});
