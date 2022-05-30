import request from "supertest";
import { app } from "../../app";
import { signupCookie } from "../../test/authHelper";

const createTicket = (title: string, price: number) => {
  const cookie = signupCookie();

  return request(app).post("/api/tickets").set("Cookie", cookie).send({
    title,
    price,
  });
};

it("returns list of tickets", async () => {
  await createTicket("concert", 100);
  await createTicket("football", 10);
  await createTicket("basketbal", 200);

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
