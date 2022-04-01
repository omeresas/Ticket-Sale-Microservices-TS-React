## Implement the posts app and test manually

### Start implementing the posts app:

1. Create an `index.js` file inside `posts` folder, use `randomBytes` from `crypto` to generate `id`s and `body-parser` middleware to parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.

```js
const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts", (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  res.status(201).send(posts[id]);
});

app.listen(4000, () => {
  console.log("Listening on 4000");
});
```

2. Add start script inside `package.json` to run `nodemon`, to automatically restart the `node` application when file changes are detected in the directory.

```js
  "scripts": {
    "start": "nodemon index.js"
  }
```

3. Start `posts` app with:

```shell
npm start
```

### Test manually using Postman:

1. Start `Postman Agent` and open up `Postman` in the browser.
2. Set `Content-Type` header to `application/json`, make the first POST request by sending `json` request body, pay attention to `"` around keys in `JSON`:

```json
{
  "title": "First Post"
}
```

3. Expect the response to be in the form:

```json
{
  "id": "e93a05b1",
  "title": "First Post"
}
```

4. Expect the response to GET requests in the form:

```json
{
  "e93a05b1": {
    "id": "e93a05b1",
    "title": "First Post"
  },
  "2961e5ef": {
    "id": "2961e5ef",
    "title": "Second Post"
  }
}
```
