## Lessons from Mini-Blog-App

### Main take-home points

- The big challenge in microservices is data. Working with multiple data models in multiple services is quite challenging.
- There are different ways to share data between microservices. We are going to focus on the async communication and communicating changes by sending events to a production-quality event bus in the next application.
- Async communication makes services more self-sufficient, makes it relatively easier to handle temporary downtime or new service creation.
- Docker makes it easier to package up services.
- Kubernetes is not trivial to set up, but makes it easier to deploy and scale services.

### Painful things we dealt with in mini-blog-app

- We had lots of duplicated code, such as express setup, same looking route handlers, duplicated logic regarding sending events etc.
- It was not easy to picture the flow of events and remember the properties of these events.
- It was difficult to test some event flows. What if someone created a comment after editing ten others after editing a post etc...
- Machine might get laggy running K8s and many services.

### Solutions to above problems

- Build a central library as an NPM module to share code between services, **without overdoing it**.
- Precisely define all the events in this shared library.
- Write everything in Typescript.
- Write tests for as much as possible/reasonable code.
- Run the K8s cluster in cloud and develop on it almost as quickly as local.
- Introduce code to handle concurrency issues.
