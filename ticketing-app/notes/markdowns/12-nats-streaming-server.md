## Introduction to NATS

Software applications and services need to exchange data. NATS is an infrastructure, maintained by CNCF, that allows such data exchange, segmented in the form of messages, in other words, a "message oriented middleware".
With NATS, application developers can:

- Effortlessly build distributed and scalable client-server applications.
- Store and distribute data in realtime in a general manner. This can flexibly be achieved across various environments, languages, cloud providers and on-premises systems.
  For more info, refer to [official docs](https://docs.nats.io).

**Important note:** The implementation we will be using is the NATS Streaming Server, aka **STAN**, which is built on top of core NATS. For more info, refer to [official docs of STAN](https://docs.nats.io/legacy/stan/intro).

**Update:** STAN is being deprecated by June 2023, to be replaced by JetStream, however, for the purpose of our project, STAN will be more than okay.
