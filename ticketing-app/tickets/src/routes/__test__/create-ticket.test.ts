import request from "supertest";
import { app } from "../../app";
import { signupCookie } from "../../test/authHelper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.statusCode).not.toEqual(404);
});

it("cannot be accessed if the user is not signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("can only be accessed if the user is signed in", async () => {
  const cookie = signupCookie();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});

  expect(response.statusCode).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {});

it("returns an error if an invalid price is provided", async () => {});

it("creates a ticket with valid inputs", async () => {});
