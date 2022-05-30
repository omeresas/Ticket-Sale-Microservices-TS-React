import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@oetickets/common";
import { CreateTicketRouter } from "./routes/create-ticket";
import { GetTicketByIdRouter } from "./routes/get-ticket-byid";
import { GetAllTicketsRouter } from "./routes/get-all-tickets";
import { UpdateTicketRouter } from "./routes/update-ticket";

const app = express();

app.set("trust proxy", true); // to make Express trust HTTPS connections from proxies
app.use(express.json());
app.use(
  cookieSession({
    signed: false, // to disable encryption of cookies
    secure: process.env.NODE_ENV !== "test", // do not require HTTPS if app runs in a test env
  })
);

app.use(currentUser);

app.use(CreateTicketRouter);
app.use(GetTicketByIdRouter);
app.use(GetAllTicketsRouter);
app.use(UpdateTicketRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
