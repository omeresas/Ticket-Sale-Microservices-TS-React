import request from "supertest";
import { app } from "../../app";
import { signupCookie } from "../../test/authHelper";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "concert";
  const price = 20;

  const cookie = signupCookie();

  const postResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: title,
      price: price,
    })
    .expect(201);

  const getResponse = await request(app)
    .get(`/api/tickets/${postResponse.body.id}`)
    .send()
    .expect(200);

  expect(getResponse.body.title).toEqual(title);
  expect(getResponse.body.price).toEqual(price);
});
