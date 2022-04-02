## Introducing Event Bus and CQRS concepts

First, let's take a look at the current architecture. Currently, the frontend app makes one GET request to get the posts and one GET request **per** post to get the comments associated with that post, resulting in very inefficient communication between client and server.

![this](../screenshots/04_Current_arch.png)

One way to get all posts with all their associated comments is to possibly make a GET request such as `GET /posts?comments=true`, so that the `posts` app can call `comments` app to get all the associated comments and before returning the response. Advantages and disadvantages of this kind of synchronous communication are:

:white_check_mark: Conceptually easy to understand
:x: Introduces a dependency between services
:x: If any inter-service request fails, the overall request from client fails
:x: The entire request is only as fast as the slowest request
:x: Can easily introduce a web of requests

A better way to solve this issue is to introduce a helper app called `event bus` and another app called `query` to serve only the read attempts from client, separating Command and Query purposes as advised by CQRS design pattern.
