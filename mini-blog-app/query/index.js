const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = {
      id,
      title,
      comments: [],
    };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    posts[postId].comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;

    const comment = posts[postId].comments.find((comment) => {
      return id === comment.id;
    });

    comment.status = status;
    comment.content = content; // in case content update is implemented in the future
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");

  const res = await axios
    .get("http://event-bus-srv:4005/events")
    .catch((err) => console.log(err));

  for (let event of res.data) {
    console.log("Processing event:" + event.type);

    handleEvent(event.type, event.data);
  }
});
