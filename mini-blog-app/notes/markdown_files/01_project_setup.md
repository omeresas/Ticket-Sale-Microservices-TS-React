## Setup the Client, Posts and Comments Apps

### Initialize Git Repository and Connect It to GitHub:

1. Inside `mini-blog-app`, initialize Git repository:

```shell
git init -y
```

2. Create `.gitignore` file.
3. Add `.gitignore` and other files:

```shell
git add .gitignore
```

4. Commit your first commit:

```shell
git commit -m "initial commit"
```

5. Create a new GitHub repository.
6. Create a new remote called `origin`, located at `git@github.com:omeresas/nodejs-microservices.git`, so that you can push to `origin` without typing the whole URL:

```shell
git remote add origin git@github.com:omeresas/nodejs-microservices.git
```

7. Push the commit in the local branch named `master` to the remote named `origin`, also use `-u` flag, which is short for `git branch --set-upstream master origin/master`, specifying the source remote when you do a `git pull`:

```shell
git push -u origin master
```

### Initilize Client React App:

1. Inside `mini-blog-app`, create a React app named `client`.

```shell
npx create-react-app client
```

### Initilize Posts Express App:

1. Inside `mini-blog-app`, create a folder named `posts` and enter into it:

```shell
mkdir posts
cd posts
```

2. Generate `package.json` file and install the four dependecies below:

```shell
npm init -y
npm install express cors axios nodemon
```

### Initilize Comments Express App:

1. Go back to `mini-blog-app` folder and do the same for `comments` app:

```shell
cd ..
mkdir comments
cd comments
npm init -y
npm install express cors axios nodemon
```

## Implement the Posts App and Test Manually

### Start Implementing the Posts App:

1. Create an `index.js` file inside `posts` folder, use `randomBytes` from `crypto` to generate `id`s and `express.json()` middleware to parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.

```js
const express = require("express");
const { randomBytes } = require("crypto");

const app = express();
app.use(express.json());

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

### Test Manually Using Postman:

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

## Implement the Comments App and Test Manually

### Start Implementing the Comments App:

1. Implement the comments app similary:

```js
const express = require("express");
const { randomBytes } = require("crypto");

const app = express();
app.use(express.json());

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

### Test Manually Using Postman:

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
