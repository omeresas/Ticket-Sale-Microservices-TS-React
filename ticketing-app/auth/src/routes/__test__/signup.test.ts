import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);
});

it("returns a 400 on invalid email", () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "examplecom",
      password: "password",
    })
    .expect(400);
});

it("returns a 400 on invalid password", () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "12",
    })
    .expect(400);
});

it("returns a 400 on missing email and passwords", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ password: "password" })
    .expect(400);

  return request(app)
    .post("/api/users/signup")
    .send({ email: "something@example.com" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(400);
});
