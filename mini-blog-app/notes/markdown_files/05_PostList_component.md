## Create the PostList component

Implement `PostList` functional component that makes GET requests to `posts` app and renders the posts in Bootstrap cards.

```js
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

const PostList = () => {
  const [posts, setPosts] = useState({});

  const fetchPosts = async () => {
    const res = await axios.get("http://localhost:4000/posts");

    setPosts(res.data); //axios uses res.data
  };

  // empty array of variables to check before re-rendering, fetch posts only once
  useEffect(() => {
    fetchPosts();
  }, []);

  const renderedPosts = Object.values(posts).map((post) => {
    return (
      <div
        className="card"
        style={{ width: "30%", marginBottom: "20px" }}
        key={posts.id} // because we generate list of elements, react expects key property on each element
      >
        <div className="card-body">
          <h3>{post.title}</h3>
        </div>
      </div>
    );
  });

  return (
    <div className="d-flex flex-row flew-wrap justify-content-between">
      {renderedPosts}
    </div>
  );
};

export default PostList;
```
