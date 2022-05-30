## Setting Up Tickets Service

Let's start implementing our second business-logic service `tickets` that deal with simple CRUD operations related to tickets.

<p>
<img src="../images/68-tickets-1.png" alt="drawing" width=500"/>
</p>

1. To save us some time, copy-paste all Dockerfile and package.json-ish files from `auth` service to a new `tickets` folder. Also copy `test`, `app.ts` and `index.ts` from `src` of `auth` service.

2. Do a `npm install` inside `tickets`. Create Docker image and push to Dockerhub. Create K8s deployment and ClusterIP services for `tickets` and `tickets-mongo` services and update`skaffold.yaml` as well.

3. Leave out `JWT_KEY` environment variable since the we decided to **do autherization inside individual services**, so it will try to read the contents of a valid `currentUser` cookie.

4. To not have connection strings to mongo instances hardcoded in code, let's have them as env variables. Modify `tickets` K8s deployment file to have:

```yaml
env:
  - name: MONGO_URI
    value: "mongodb://tickets-mongo-srv:27017/tickets"
```

We wrote the connection string as plain text since connecting to the DB did not require username and password in this case. Otherwise, we would create a K8s secret and share username and password via secrets. Change connection statement in `tickets` into:

```ts
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI must be defined");
}

try {
  await mongoose.connect(process.env.MONGO_URI);
} catch (err) {
  console.error(err);
}
```

Do similar changes for `auth` service as well.

## Applying Test-First Approach for Ticket Creation

For the development process of `tickets` service, we will be writing tests first, then try to implement logic to pass the written tests.

1. Inside `src/routes/__test__`, create test file `create-ticket.test.ts` which will test `create-ticket.ts` router. Let's define some test:

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening to /api/tickets for post requests", async () => {});

it("cannot be accessed if the user is not signed in", async () => {});

it("can only be accessed if the user is signed in", async () => {});

it("returns an error if an invalid title is provided", async () => {});

it("returns an error if an invalid price is provided", async () => {});

it("creates a ticket with valid inputs", async () => {});
```

2. For the very first test, we just want from `tickets` service to actually have a route handler for POST requests to`/api/tickets`. In the second test, we expect to have 401 status code which is for authorization errors. Implement the router for these two tests.

```ts
it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.statusCode).not.toEqual(404);
});

it("cannot be accessed if the user is not signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});
```

3. Next, we check whether users with valid cookie can access the service.

```ts
it("can only be accessed if the user is signed in", async () => {
  const cookie = signupCookie();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});

  expect(response.statusCode).not.toEqual(401);
});
```

To test the `ticketing` service, we should not need to make requests to `auth` service or any other service. Therefore, in order to have a valid cookie, we will generate our own one. Add a helper function similar to the one we used for `currentUser` test. Generate a valid cookie in `test/authHelper.ts`:

```ts
import jwt from "jsonwebtoken";

const signupCookie = () => {
  // Build a JWT payload
  const payload = {
    id: "123123",
    email: "test@example.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object
  const session = {
    jwt: token,
  };

  // Turn that session into JSON
  const sessionJson = JSON.stringify(session);

  // Take JSON and encode as Base64
  const encodedString = Buffer.from(sessionJson).toString("base64");

  // Return a string that is the cookie with the encoded data
  return [`session=${encodedString};`];
};

export { signupCookie };
```

4. **Implementation note for the third test:** To be able to decode the cookie, the `app.ts` of `tickets` service can utilize `currentUser` middleware we put inside our `@oetickets/common` package. It will decode the token into a `UserPayload`. Then, you can add `requireAuth` middleware from `common` package inside route handlers that you think requires authorization, such as creating a ticket like in this case.`requireAuth` middleware will throw `NotAuthorizedError` in cases where the request does not have a decoded and valid `UserPayload` as `currentUser` property of `Request` object.

5. Let's add two tests about the attributes needed to create a ticket. Don't forget to add a valid JWT inside cookies to pass the authorization step. You can use `express-validator` and our `validateRequest` middleware to add neceessary validation rules to the route handler. Add them after `requireAuth` middleware so that the handler **fails fast**.

```ts
it("returns an error if an invalid title is provided", async () => {
  const cookie = signupCookie();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      price: 100,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 100,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  const cookie = signupCookie();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "valid title",
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "valid title",
      price: -10,
    })
    .expect(400);
});
```

6. To test the creation of a ticket inside Mongo, or Mongo-memory-server as in this case, create a valid request and check whether the number of documents are incremented by one, or check actual properties of the created document. To implement this, add `src/models/Ticket.ts` to model it similar to a user model we prepared for the `auth` service. **Associate created tickets with their creator users using `req.currentUser.id`.**

```ts
it("creates a ticket with valid inputs", async () => {
  const cookie = signupCookie();

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const price = 100;

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "valid title",
      price: price,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(price);
});
```

## Implementing Get Ticket Routes

1. Simply, let's check two simple cases below as `get-ticket-byid.test.ts`:

```ts
import request from "supertest";
import { app } from "../../app";
import { signupCookie } from "../../test/authHelper";

it("returns a 404 if the ticket is not found", async () => {
  await request(app).get("/api/tickets/someGibberishId").send().expect(404);
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
```

Implement the route, in case the ticket is not found in mongo-memory-server, throw a `NotFoundError`. The first test will throw an error, kind of which we did not create as one of our custom errors. To see the source of the error, add a `console.log` to our `errorHandler` module dependency **temporarily**, as we would not want to change logic of our installed dependencies.

2. Before solving the error, let's improve the error logging feature of our `errorHandler` middleware inside `@oetickets/common` package, since we would like to set some info about the errors. Add `console.error(err);` to our error handler and publish it to npm by `npm run pub`. Update the common package for `tickets` app by `npm update @oetickets/common`.

3. Because mongoose gives error while casting a string to an ID, let's try with a valid ID as a parameter inside the request.

```ts
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});
```

4. **Implementation tip:** Search for the ticket by `Ticket.findById(req.params.id)`, throw `NotFoundError` if not found, otherwise return the ticket.

5. Let's add one test as `get-all-tickets.test.ts`:

```ts
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
```

6. **Implementation tip:** Search for all tickets by `Ticket.find({})`, return the result, **do not throw error if no ticket is found**.

## Implementing Ticket Updating Route

1. Lastly, write tests for updating ticket as `update-ticket.test.ts`. Let's start with some authorization, as we would like the user to be signed in to update the ticket and the ticket to be updated only by its creator.

```ts
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
  const postResponse = await createTicket("concert", 100);

  const anotherUserCookie = signupCookie();

  await request(app)
    .put(`/api/tickets/${postResponse.body.id}`)
    .set("Cookie", anotherUserCookie)
    .send({ title: "football", price: 200 })
    .expect(401);
});
```

**Note:** The current implementation of cookie generation uses hard-coded user credentials. Use id creation to randomly create user id in `authHelper.ts`:

```ts
// Build a JWT payload
const payload = {
  id: new mongoose.Types.ObjectId().toHexString(),
  email: "test@example.com",
};
```

2. Next, add below two tests. Implementation for update is more or less straight-forward, as update is a combination of read and write.

```ts
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
```

3. **Last but not least**, add the routes we implemented in `ingress-srv.yaml` so that it points to `tickets-srv`. Make sure to add the rule **before catch-all statement**.

```yaml
- path: /api/tickets/?(.*)
  pathType: Prefix
  backend:
    service:
      name: tickets-srv
      port:
        number: 3000
```

4. Now you can try the `tickets` service routes manually using Postman after instantiating via `skaffold dev`.
