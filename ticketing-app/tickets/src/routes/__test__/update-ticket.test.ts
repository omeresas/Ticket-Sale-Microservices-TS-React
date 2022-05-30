import request from "supertest";
import { app } from "../../app";
import { signupCookie } from "../../test/authHelper";
import mongoose from "mongoose";

it("return a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "concert", price: 100 })
    .expect(401);
});

it("returns a 404 if the provided ticket id does not exist", async () => {
  const cookie = signupCookie();

  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({ title: "concert", price: 100 })
    .expect(404);
});

it("returns a 401 if the user is not the ticket creator", async () => {
  const cookie = signupCookie();

  const postResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "concert",
      price: 100,
    });

  const anotherUserCookie = signupCookie();

  await request(app)
    .put(`/api/tickets/${postResponse.body.id}`)
    .set("Cookie", anotherUserCookie)
    .send({ title: "football", price: 200 })
    .expect(401);
});

it("return a 400 if the user provides invalid title or price", async () => {
  const cookie = signupCookie();

  const postResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "concert",
      price: 100,
    });

  await request(app)
    .put(`/api/tickets/${postResponse.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 200 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${postResponse.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "cinema", price: -10 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${postResponse.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "football" })
    .expect(400);
});

it("updates the ticket with valid input values", async () => {
  const cookie = signupCookie();

  const postResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "concert",
      price: 100,
    });

  await request(app)
    .put(`/api/tickets/${postResponse.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "basketball", price: 200 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${postResponse.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("basketball");
  expect(ticketResponse.body.price).toEqual(200);
});
