const express = require("express");
const axious = require("axios");

const app = express();
app.use(express.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    const status = data.content.includes("badword") ? "rejected" : "approved";

    await axious
      .post("http://localhost:4005/events", {
        type: "CommentModerated",
        data: {
          id: data.id,
          content: data.content,
          postId: data.postId,
          status,
        },
      })
      .catch((err) => {
        console.log(err);
      });
  }

  res.send();
});

app.listen(4003, () => {
  console.log("Listening on 4003");
});
