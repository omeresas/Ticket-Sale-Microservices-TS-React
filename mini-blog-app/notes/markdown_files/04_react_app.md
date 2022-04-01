## Create first React component

### Start implementing the client app:

1. Inside `client` folder, install `axios` to make request to Express apps.

```shell
npm install axios
```

2. Inside `src`, create `index.js` to render the main app inside `div` with `root` id:

```js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));
```

3. Then, create `app.js`:

```js
import React from "react";

const App = () => {
  return <div>Mini Blog App</div>;
};

export default App;
```

4. Start `client` app with:

```shell
npm start
```

### Create PostCreate component:

1. Create `PostCreate.js` to implement React component for post submission:

```js
import React from "react";

const PostCreate = () => {
  return (
    <div>
      <form>
        <div className="form-group">
          <label>Title</label>
          <input className="form-control" />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default PostCreate;
```

2. Include `PostCreate` component inside `App` component:

```js
const App = () => {
  return (
    <div>
      <h1>Create Post</h1>
      <PostCreate />
    </div>
  );
};
```

### Hook up Bootstrap:

1. Find `BootstrapCDN` link to apply Bootstrap CSS, add to `public/index/html`"

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
  integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
  crossorigin="anonymous"
/>
```

2. Add `container` classname to `App` component so that `App` does not use the whole screen:

```js
const App = () => {
  return (
    <div className="container">
      <h1>Create Post</h1>
      <PostCreate />
    </div>
  );
}"
```

3. Frontend app now should look like:

![this](../screenshots/01_PostCreate.png)
