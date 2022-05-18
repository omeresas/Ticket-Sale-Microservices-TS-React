## Integrating Next.js Client App

For the front-end application, we will be using **Next.js** to create a **Server-side rendered** React application.

### Implementing the SignUp Component

1. Just like the`auth` service, create a new folder, initilize npm, install dependencies, create Docker image, Kubernetes deployment and ClusterIP objects. For the port number, use 3000 as it is the default port for Next.js.

```shell
npm init -y
npm install react react-dom next
```

In addition, add a "catch all" rule in the `ingress-srv.yaml` at the end of file:

```yaml
- path: /?(.*)
  pathType: Prefix
  backend:
    service:
      name: client-srv
      port:
        number: 3000
```

Try accessing "ticketing.dev" inside the browser, type "thisisunsafe" if you get a security warning.

2. To help solve problems with file syncing with Next.js inside a Docker container, add poll mechanism every 300 ms. In a file `client/next.config.js`:

```js
module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
```

3. We are going to add Bootstrap as a global CSS in the Next.js app, however, we can only import global CSS files inside `_app.js` component which Next.js renders for all pages, so we add a thin wrapper `_app.js` and import Bootstrap there.
   First, install Bootstrap:

```shell
npm install bootstrap
```

Then, create the wrapper `pages/_app.js`:

```js
import "bootstrap/dist/css/bootstrap.css";

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

For more info about this issue, refer to [https://github.com/vercel/next.js/blob/canary/errors/css-global.md](https://github.com/vercel/next.js/blob/canary/errors/css-global.md)

4. Start implementing the sign up form component in `pages/auth/signup.js`, so that it can be filled at "ticketing.dev/auth/signup". First, **create the form** and make use of **`useState`** React hook for email and password values. Second, add **`onSubmit` event handler** on the form and use axios **to make a POST request**. You should see the response and saved cookie in the browser after a **successful signup**.

5. For the **unsuccessful** signup, we need to **show the related error message** inside some component. For this reason, move the POST request inside a try block and catch errors. Use another `useState` hook for errors and if their number is greater than zero, show them as a list. Up until now, the code looks like:

```js
import { useState } from "react";
import axios from "axios";

export default function signUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post("/api/users/signup", {
        email,
        password,
      });

      console.log(response.data);
    } catch (err) {
      setErrors(err.response.data.errors);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {errors.map((error) => (
              <li key={error.message}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
}
```

The form with both errors look like:

<p>
<img src="../images/50-client-signup-2.png" alt="drawing" width="600"/>
</p>

6. In the frontend app, we will be making a number of requests in the future, so it makes sense the **create our own function or hook that lets us make requests and render errors**.

<p>
<img src="../images/49-client-signup-1.png" alt="drawing" width="600"/>
</p>

In the file `client/hooks/use-request.js`:

```js
import axios from "axios";
import { useState } from "react";

export default function useRequest({ url, method, body }) {
  const [errors, setErrors] = useState(null);

  async function doRequest() {
    try {
      setErrors(null);
      const response = await axios[method](url, body);
      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return { doRequest, errors };
}
```

Now, the sign up logic is simplified to:

```js
import { useState } from "react";
import useRequest from "../../hooks/use-request";

export default function signUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: {
      email,
      password,
    },
  });

  async function onSubmit(event) {
    event.preventDefault();

    doRequest();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
}
```

7. Next, after a succesful sign-up, let's redirect user to the home page. For this, simply add a callback function in the `useRequest` hook to be called on success:

```js
export default function useRequest({ url, method, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  async function doRequest() {
    try {
      setErrors(null);
      const response = await axios[method](url, body);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    catch (err) {
      ...
    }
```

and provide a callback function that redirects to home page in the `signUp` component:

```js
import Router from "next/router";

...

const { doRequest, errors } = useRequest({
  url: "/api/users/signup",
  method: "post",
  body: {
    email,
    password,
  },
  onSuccess: () => Router.push("/"),
});
```

### Fetching Sign In Data During SSR

1. To check whether the user is already signed in, we need to make a GET request to `/api/users/currentuser`. However, the components are rendered on the server side and we need to make the request before the full page is rendered.

<p>
<img src="../images/51-client-signin-1.png" alt="drawing" width="700"/>
</p>

We cannot make the request from inside the browser, but `getInitialProps` function lets us make requests before components are rendered.

<p>
<img src="../images/52-client-signin-2.png" alt="drawing" width="600"/>
</p>

In `index.js`:

```js
import axios from "axios";

const homePage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>Home Page!</h1>;
};

homePage.getInitialProps = async () => {
  const response = await axios.get("/api/users/currentuser");

  return response.data;
};

export default homePage;
```

2. Try accessing the home page in the browser, you should the `Error: connect ECONNREFUSED 127.0.0.1:80` error. This happens because we are making the GET request **from inside the `client` container** and it does not goes to Ingress-Nginx for it to transfer the request to the `auth` service. If we made the request from inside the browser like below, getting the data after SSR render in the browser, it would have worked.

<p>
<img src="../images/53-client-signin-3.png" alt="drawing" width=900"/>
</p>

On the other hand, our setup looks like this:

<p>
<img src="../images/54-client-signin-4.png" alt="drawing" width=1200"/>
</p>

Because the domain is not automatically specified as "ticketing.dev" like the browser did, NodeJS http layer added localhost automatically. However, **this 127.0.0.1 is not the localhost of your computer**, **it is the localhost inside the K8s container**, and there is no one listening on port 80 on that container.

3. To solve this issue, we slighty modify `axios` to add domains to the request depending on the environment the request is made. Specifically, we **add domain prefix if the request is made from the server-side**, as for the client-side, the browser automatically does that for us.

<p>
<img src="../images/55-client-signin-5.png" alt="drawing" width=800"/>
</p>

We can either make the request directly to the `auth` service in this case, or as we will do now, **implement the general case and make the request to the Ingress-Nginx**. We also need to manually transfer the cookie when we make request to back-end services.

<p>
<img src="../images/56-client-signin-6.png" alt="drawing" width=800"/>
</p>

### Making Requests to a Service in another Namespace

1. We can access services using the `http://auth-srv` style only when they are in the same namespace.

<p>
<img src="../images/57-client-signin-7.png" alt="drawing" width=600"/>
</p>

2. However, cross-namespace communication uses the pattern `<service-name>.<namespace-name>.svc.cluster.local/api/...`. To get the name of the service we need to access, do a `kubectl get services -n ingress-nginx`. The name of the service we need to access is `ingress-nginx-controller`.

<p>
<img src="../images/58-client-signin-8.png" alt="drawing" width=600"/>
</p>

3. We can also create a **External Name Service** to shorten the URL, but we are **not** going to do that to keep things simple.

<p>
<img src="../images/59-client-signin-9.png" alt="drawing" width=600"/>
</p>
