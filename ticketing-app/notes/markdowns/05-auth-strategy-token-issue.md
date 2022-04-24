## Authentication Strategies

- There are various ways to do user authentication in a microservices application.

<p>
<img src="../images/12-auth-option-1.png" alt="drawing" width="700"/>
</p>

<p>
<img src="../images/13-auth-option-1-1.png" alt="drawing" width="700"/>
</p>

<p>
<img src="../images/14-auth-option-2.png" alt="drawing" width="700"/>
</p>

- We will go with **fundemental option 2**, which results in **more independent services** but with **duplicated logic**, **possibly shared via an npm module** about to do token-related tasks.

## Need for Token Lifetime

<p>
<img src="../images/15-token-problem-1.png" alt="drawing" width="700"/>
</p>

<p>
<img src="../images/16-token-problem-2.png" alt="drawing" width="700"/>
</p>

<p>
<img src="../images/17-token-problem-3.png" alt="drawing" width="700"/>
</p>

<p>
<img src="../images/18-token-problem-4.png" alt="drawing" width="900"/>
</p>

<p>
<img src="../images/19-token-problem-5.png" alt="drawing" width="700"/>
</p>

<p>
<img src="../images/20-token-problem-6.png" alt="drawing" width="700"/>
</p>

- In case the security requirements are more strict, for example, banned users with valid tokens being able to make requests in a window of time until their tokens expire, we can make use of events and store the list of banned users in cache of services for a limited amount of time, which should be equal to the lifetime of a token.

<p>
<img src="../images/21-token-problem-7.png" alt="drawing" width="700"/>
</p>

## Reminder on Cookies and JWT

Cookies:

- Transport mechanism.
- Moves any kind of data between browser and server.
- Automatically managed by the browser.

JSON Web Tokens:

- Authentication/authorization mechanism.
- Stores any data we want.
- We have to manage it manually.

<p>
<img src="../images/22-cookie.png" alt="drawing" width="400"/>
</p>

<p>
<img src="../images/23-jwt.png" alt="drawing" width="400"/>
</p>

## Requirements for Our Auth Mechanism

<p>
<img src="../images/24-auth-req-1.png" alt="drawing" width="600"/>
</p>

<p>
<img src="../images/25-auth-req-2.png" alt="drawing" width="600"/>
</p>

<p>
<img src="../images/26-auth-req-3.png" alt="drawing" width="600"/>
</p>

<p>
<img src="../images/27-auth-req-4.png" alt="drawing" width="600"/>
</p>

## Server-Side-Rendering and Sending Tokens over to Server

- In a normal React app, the client does not have to send the custom JWT inside the very first request to the server.

<p>
<img src="../images/28-ssr-1.png" alt="drawing" width="700"/>
</p>

- However, with SSR, the server needs the auth data in the very first request, which cannot be customised like the above case after some ordinary requests and responses.

<p>
<img src="../images/29-ssr-2.png" alt="drawing" width="700"/>
</p>

- **Storing JWTs inside the cookies** is the (almost) only way to communicate info in the first request to the server when using SSR. We can also use **service workers** but it is much more complicated.

<p>
<img src="../images/30-ssr-3.png" alt="drawing" width="600"/>
</p>

## Encryption of Cookie Contents

- Cookie handling across programming languages (in a typical microservices app) is usually an issue when we encrypt the data in the cookie.
- Even though we will be using Node.js for our services, for simplicity, **we will not encrypt the cookie contents**.
- **JWTs are tamper resistant**, in other words, users will be able to read the cookie contents (JWTs), but if they try to modify the content of the JWT, it will be invalid immediately.
- Although in general this is not a big concern, you can still encrypt the cookie contents if it is a big deal for you, for example, if you are going to store protected information in a JWT, which you should **not** be doing.
