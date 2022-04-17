const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  // if undefined, give me empty array
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: "pending" });

  commentsByPostId[req.params.id] = comments;

  await axios
    .post("http://event-bus-srv:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: "pending",
      },
    })
    .catch((err) => {
      console.log(err);
    });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  console.log("Received event", type);

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;

    const comment = commentsByPostId[postId].find((comment) => {
      return comment.id === id;
    });

    await axios
      .post("http://event-bus-srv:4005/events", {
        type: "CommentUpdated",
        data: {
          id,
          content,
          postId,
          status,
        },
      })
      .catch((err) => {
        console.log(err);
      });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
