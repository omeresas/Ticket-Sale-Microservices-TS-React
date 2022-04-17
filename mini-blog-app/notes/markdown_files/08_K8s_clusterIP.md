## Setting Up a ClusterIP Service

1. Let's create a clusterIP service for the `event-bus` service, so that other services can send it events. In a file named `event-bus-depl.yaml`, we will specify both the deployment and the clusterIP for the `event-bus`. `type: ClusterIP` is optional, without this field it defaults to clusterIP as well.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: event-bus-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: event-bus
  template:
    metadata:
      labels:
        app: event-bus
    spec:
      containers:
        - name: event-bus
          image: oesasdocker/event-bus
---
apiVersion: v1
kind: Service
metadata:
  name: event-bus-srv
spec:
  selector:
    app: event-bus
  type: ClusterIP
  ports:
    - name: event-bus
      protocol: TCP
      port: 4005
      targetPort: 4005
```

2. Create a clusterIP for the `posts` service too. Don't forget to apply config files.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: posts-srv
spec:
  selector:
    app: posts
  ports:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000
```

3. Update addresses of `posts` and `event-bus` to their clusterIPs inside the `posts` and `event-bus` code. For example, in `index.js` of posts:

````js
await axios
    .post("http://event-bus-srv:4005/events", {
      type: "PostCreated",
      data: {
        id,
        title,
      },
    })
    .catch((err) => {
      console.log(err);
    });
    ```
````

4. Re-build images of `posts` and `event-bus`, push to Docker Hub.
5. `rollout restart deployment` for both `posts-depl` and `event-bus-depl`, so that they run the latest images with clusterIP addresses.
6. Verify communication using Postman. Make sure you also run a `nodePort` for `posts` service for testing purposes.

- Learn actual `nodePort` by `kubectl get services`.
- Make a POST request to `localhost:30232/posts` to verify nodePort service.
- Run `kubectl get pods` and `kubectl logs posts-depl-67bf9ff9fb-7f5kd` to see logs of `posts` service. You should see "Received event PostCreated" which is sent by event bus.
