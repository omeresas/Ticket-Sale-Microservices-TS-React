## Testing with Microservices

### Testing Scopes

In short, we have four different scopes of testing.

<p>
<img src="../images/41-testing-1.png" alt="drawing" width="800"/>
</p>

It can be very complex to test different services, so we need to figure out a way to create an environment in which different services run, in an easy and cost-effective way.

<p>
<img src="../images/42-testing-2.png" alt="drawing" width="800"/>
</p>

### Testing Goals

<p>
<img src="../images/43-testing-3.png" alt="drawing" width="600"/>
</p>

<p>
<img src="../images/44-testing-4.png" alt="drawing" width="600"/>
</p>

<p>
<img src="../images/45-testing-5.png" alt="drawing" width="600"/>
</p>

For now, we will focus only on **testing goal #1**.

### How to run tests?

- We are going to run these tests directly from our terminal without using Docker.
- This implies that our **local environment** is capable of running each service!
- Simple enough now, but more complex projects might make this hard.

### Testing Architecture

We will use **Jest testing framework** to implement tests. Jest will:

- Start in-memory copy of MongoDB
- Start up our Express app
- Use supertest library to make fake requests to our Express app
- Run assertions to make sure the request did the right thing

### Refactoring: Separating app.js from index.js

<p>
<img src="../images/46-testing-6.png" alt="drawing" width="400"/>
</p>

<p>
<img src="../images/47-testing-7.png" alt="drawing" width="550"/>
</p>

<p>
<img src="../images/48-testing-8.png" alt="drawing" width="500"/>
</p>

- **Npm supertest:** You may pass an http.Server, or a Function to request() - if the server is not already listening for connections then it is bound to an ephemeral port (random port not in use) for you so there is no need to keep track of ports.

- Turns out there are also **other benefits to using the ideal setup** (creating app but not using it or making it listen on a specific port), other than those related to testing

- To refactor, create a new file `app.ts`, cut and paste code from `index.ts`, the portion until `start` function. Import `app.ts` in `index.ts`. The new file `app.ts` will just look like:

```ts
import express from "express";
import "express-async-errors";
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

export { app };
```

### Adding Jest Testing Framework

1. Install testing libraries and in-memory MongoDB, use `--save-dev` flag to avoid installing these dependencies when Docker images are built, they are only for dev purposes:

```shell
npm install --save-dev jest ts-jest supertest mongodb-memory-server @types/jest @types/supertest
```

Also update Dockerfile of `auth` service as:

```Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --only-prod
COPY ./ ./

CMD ["npm", "start"]
```

2. Add a `npm test` command inside `package.json`. Use `--watchAll` flag to watch files for changes and rerun tests related to changed files. You can also use `--no-cache` to disable test cache to fix problems of jest due to using on TS. Then, add settings about jest. First one is to make use of TS support for jest and the last one is the setup file to run before tests.

```json
  "scripts": {
    "start": "ts-node-dev --poll src/index.ts",
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "setupFilesAfterEnv": [
      "./src/test/setup.ts"
    ]
  },
```

3. Create the below `setup.ts` file. Before each test, we will reset the state of data by wiping the collections present in in-memory Mongo instance. Define `JWT_EKY` env variable for JWT creation logic in sign up and sign in middlewares, as it was defined only when the service runs inside a pod.

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "someRandomString";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
```

### Writing Tests

1. To test some code with Jest, create a folder `__test__` in the same folder as the code you want to test, and use the `.test.ts` naming convention. For example, to test `src/routes/signup.ts`, as we will do now, create `src/routes/__test__/signup.test.ts`, even though tests for other routes in the file would work as well. Use `supertest` to instantiate server and make HTTP requests. The first test will test the **successful path**:

```ts
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
```

2. Run `npm test` and in the future in case the tests always fail even if you change and save the code, just restart the tests from CLI.

3. Write other simple tests:

```ts
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
```

4. Write a test that checks whether there is a `Set-Cookie` header in the response, so that the browser saves the cookie. Currently, our app sets cookies only if the requests are made through HTTPS. However, supertest library makes plain HTTP requests, so we need to let our server be okay with HTTP requests if we are in a test environment. In `app.ts`, change `cookieSession` middleware setting into:

```ts
app.use(
  cookieSession({
    signed: false, // to disable encryption of cookies
    secure: process.env.NODE_ENV !== "test", // do not require HTTPS if app runs in a test env
  })
);
```

Then, write the test:

```ts
it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
```

5. Write tests for sign-in route in `signin.test.ts` file:

```ts
import request from "supertest";
import { app } from "../../app";

it("fails when a non-existent email is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(400);
});

it("fails when incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signin")
    .send({
      email: "something@example.com",
      password: "incorrectPass",
    })
    .expect(400);
});

it("responds with a cookie when given valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
```

6. Write a test for sign-out route in `signout.test.ts`. To check whether the cookie is set to be deleted, you can test whether it is equal to below string which clears the session object in the browser:

```ts
import request from "supertest";
import { app } from "../../app";

it("clears the cookie after sign-out", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200);

  console.log(response.get("Set-Cookie"));
  expect(response.get("Set-Cookie")[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
```

7. Write tests for the current user route.

```ts
import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  console.log(response.body);
});
```

Unlike browsers or Postman, supertest does not manage cookies automatically, **so the next request we are making does not have the cookie set from the previous request**. Therefore, current user route does not see any cookie in the request and returns `{currentUser: null}` inside `response.body`. We extract the cookie and set it on the next request manually:

```ts
import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  const authResponse = await request(app)
    .post("/api/users/signup")
    .send({
      email: "something@example.com",
      password: "password",
    })
    .expect(201);

  const cookie = authResponse.get("Set-Cookie");

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("something@example.com");
});
```

7. In the future, we will need authentication cookie before various test, so create a helper function that signs up a new user and returns its cookie, in `test/authHelper.ts`:

```ts
import request from "supertest";
import { app } from "../app";

const signupCookie = async () => {
  const email = "something@example.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  const cookie = response.get("Set-Cookie");
  return cookie;
};

export { signupCookie };
```

Modify the current user test to use `signupCookie` helper function:

```ts
it("responds with details about the current user", async () => {
  const cookie = await signupCookie();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("something@example.com");
});
```

8. Complete the current user tests with another one:

```ts
it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send({})
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
```
