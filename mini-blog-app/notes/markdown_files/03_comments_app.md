## Implement the comments app and test manually

### Start implementing the comments app:

1. Implement the comments app similary:

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

2. Add start script:

```js
  "scripts": {
    "start": "nodemon index.js"
  }
```

3. Start `comments` app with:

```shell
npm start
```

### Test manually using Postman:

1. Set HTTP headers and Postman similarly and make your POST request including your first comment to a post with `id` such as 100:

```json
{
  "content": "I am a comment"
}
```

2. After adding comments, expect response of GET requests to `/posts/100/comments` in the form:

```json
[
  {
    "id": "1b7d1ad8",
    "content": "I am a comment"
  },
  {
    "id": "bec41035",
    "content": "I am another comment"
  }
]
```
