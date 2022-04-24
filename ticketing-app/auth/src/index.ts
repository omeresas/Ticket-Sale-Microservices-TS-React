import express from "express";
import "express-async-errors";
import mongoose from "mongoose";
import cookieSession from "cookie-session";

import { CurrentUserRouter } from "./routes/current-user";
import { SignInRouter } from "./routes/signin";
import { SignOutRouter } from "./routes/signout";
import { SignUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

app.set("trust proxy", true); // to make Express trust HTTPS connections from proxies
app.use(express.json());
app.use(
  cookieSession({
    signed: false, // to disable encryption of cookies
    secure: true, // to allow cookies only from HTTPS conneciton
  })
);

app.use(CurrentUserRouter);
app.use(SignInRouter);
app.use(SignOutRouter);
app.use(SignUpRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
  } catch (err) {
    console.error(err);
  }

  console.log("Connected to MongoDB");

  app.listen(3000, () => {
    console.log("Listening on 3000");
  });
};

start();
