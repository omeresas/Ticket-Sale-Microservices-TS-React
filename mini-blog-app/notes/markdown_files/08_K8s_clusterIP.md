## Setting Up ClusterIP Services for Posts and Event Bus

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

### Adding ClusterIP Service for Other Services

1. Update the URLs of HTTP requests in services.

2. Re-build docker images and push to Docker Hub.

3. Create a deployment and clusterIP for `moderation`, `query` and `comments` services as well.

4. Run `kubectl apply -f infra/k8s/.` to apply all created config files.

5. Update URLs in `event-bus`, re-build image, push to Docker Hub, and `kubectl rollout restart deployment event-bus-srv`.

## Installing Ingress Nginx

1. How do we call services from the client? Either we can use a NodePort for each of the posts, comments and query services, or we can make use of load balancer service.

<p align="center">
<img src="../screenshots/12_Loadbalancer.png" alt="drawing" width="700"/>
</p>

2. There are two different services when it comes to load balancers in K8s:

- `Load Balancer Service`: Tells Kubernetes to reach out to its provider and provision a load balancer. Gets traffic to a _single pod_.

- `Ingress or Ingress Controller`: A pod with a set of routing rules to distribute traffic to (clusterIP services of) other services. (Technically `ingress` and `ingress controller` are two different things, but can be used interchangebly for now.)

<p align="center">
<img src="../screenshots/13_Ingress.png" alt="drawing" width="500"/>
</p>

3. Install Ingress-Nginx: Ingress-Nginx (the one in [https://github.com/kubernetes/ingress-nginx](https://github.com/kubernetes/ingress-nginx)) creates a Load Balancer service and an Ingress automatically. Note: Kubernetes-ingress is totally different (see [https://www.nginx.com/blog/guide-to-choosing-ingress-controller-part-4-nginx-ingress-controller-options/](https://www.nginx.com/blog/guide-to-choosing-ingress-controller-part-4-nginx-ingress-controller-options/)).

Install ingress-nginx with

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.2/deploy/static/provider/cloud/deploy.yaml
```

2. Create routing rules in `ingress-srv.yaml`. Ingress will scan applied config files and try to find annotations, specifically the one we specified, to get the routing rules.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
    - host: posts.com
      http:
        paths:
          - path: /posts
            pathType: Prefix
            backend:
              service:
                name: posts-srv
                port:
                  number: 4000
```

Ingress nginx is assuming we might be running many different apps at different domains in one cluster. So we associate rules with apps hosted at particular domains.

3. To make a request from our browser to `posts-srv`, try accessing `posts.com/posts` from browser. However, instead of trying to find `posts.com` online, we need to trick our machine into thinking that `posts.com` is in fact hosted in our local machine. To do this, run `code /etc/hosts` and add line `127.0.0.1 posts.com`.

4. If you are unable to access the application you may have something already running on port 80, which is the default port for the ingress. Run `sudo lsof -i tcp:80` to see which processes use port 80. If Docker is properly listening on port 80 you should see something very similar:

<p align="center">
<img src="../screenshots/14_Port80.png" alt="drawing" width="1000"/>
</p>

If something else is listed for `TCP *:http`, you'll need to shut that service down.

## Integrating React App into the Cluster

1. Inside React components, change requests from `localhost:port` to `posts.com`. The OS will take requests to `posts.com` and find its host as `localhost` and port 80, where the ingress will be listening and routing requests to clusterIP services based on paths of requests.

2. Add two lines to Dockerfile of `client` to prevent some React-related bug in Docker containers, and push to Docker Hub:

```Dockerfile
FROM node:16-alpine

# to prevent React related bug
ENV CI=true
ENV WDS_SOCKET_PORT=0

WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY ./ ./

CMD ["npm", "start"]
```

3. Create a `client-depl.yaml` to serve HTML, CSS and JS from inside the pod, and apply it:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
        - name: client
          image: oesasdocker/client
---
apiVersion: v1
kind: Service
metadata:
  name: client-srv
spec:
  selector:
    app: client
  ports:
    - name: client
      protocol: TCP
      port: 3000
      targetPort: 3000
```

4. Bad news: ingress cannot differentiate request based on methods. So, modify routes to be unique like so:

<p align="center">
<img src="../screenshots/15_Changed_routes.png" alt="drawing" width="600"/>
</p>

Update routes in React app `client` and the `posts` service, re-build images, push to Docker Hub, and rollout restart deployments.

5. Update paths in `ingress-srv.yaml`. Ingress does not make use of wildcars with columns (:) in paths, so use wildcars with regex (the one below is any value followed by `/comments`). Add annotation to use regex. Finally, add `/` path with wildcard **at the end** to make it work with SPA approach (not used here but in general for other apps). **Path rules are ordered from greatest priority to lowest from top to bottom**.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: posts.com
      http:
        paths:
          - path: /posts/create
            pathType: Prefix
            backend:
              service:
                name: posts-srv
                port:
                  number: 4000
          - path: /posts
            pathType: Prefix
            backend:
              service:
                name: query-srv
                port:
                  number: 4002
          - path: /posts/?(.*)/comments
            pathType: Prefix
            backend:
              service:
                name: comments-srv
                port:
                  number: 4001
          - path: /?(.*)
            pathType: Prefix
            backend:
              service:
                name: client-srv
                port:
                  number: 3000
```

6. At this point, you should be able to reach `posts.com` and use the app just like before.

## Utilizing Skaffold to Automate Tasks

1. Currently, whenever we make a change to our codebase, we re-build image of the modified service, push to Docker Hub and rollout restart deployment, which is time-consuming. Instead, we can use Skaffold to automate these tasks in a Kubernetes dev environment. It makes it easy to

- Update code in a running pod
- Create/delete objects associated with a particular project

2. Install Skaffold, for example, using Brew:

```shell
brew install Skaffold
```

3. Create a file named `skaffold.yaml` inside mini-blog app folder. By specifying the config files inside manifests, we are telling Skaffold to watch these config files and anytime we make a change to those config files, Skaffold is automatically apply the config file to our Kubernetes cluster. So it saves us from applying config files whenever we modify them or create a new config file in the folder. Lastly, when we stop Skaffold, it will find the K8s objects specified under `./infra/k8s` folder and delete them.

```yaml
apiVersion: skaffold/v2alpha3
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
```

4. Whenever we make a change to to code, Skaffold will rebuild image and push to Docker Hub. To turn off this feature, we specify `push: false`. In the `artifacts` we tell Skaffold that there is going to be a pod running code out of, for example, `client` directory.

```yaml
build:
  local:
    push: false
  artifacts:
    - image: oesasdocker/client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
```

Whenever something changes in `src/**/*.js`, Skaffold will try to take those changes and update the pod with latest code. Two ways of updating a pod:

- `sync: manual`: Just take the changed file, specified js files in this case, and throw it directly inside the running pod. Inside the pods, **nodemon** or **create-react-app** is the actual agents to restart the apps (primary processes) when they see a changed file inside the folder (inside the pods). Without them, using Skaffold won't restart apps after files change inside the pod.
- For other changes that is not catched by the rules in `sync: manual:`, Skaffold will try to re-build the image, delete the old pod and run the new image in a new pod.

Do the same for other services, in the end, `skaffold.yaml` file should look like this:

```yaml
apiVersion: skaffold/v2alpha3
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  local:
    push: false
  artifacts:
    - image: oesasdocker/client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
    - image: oesasdocker/comments
      context: comments
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "*.js"
            dest: .
    - image: oesasdocker/posts
      context: posts
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "*.js"
            dest: .
    - image: oesasdocker/query
      context: query
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "*.js"
            dest: .
    - image: oesasdocker/event-bus
      context: event-bus
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "*.js"
            dest: .
    - image: oesasdocker/moderation
      context: moderation
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "*.js"
            dest: .
```

5. Run `skaffold dev` to run pods as specified. Try changing some files inside React app or other services. Changed files in the `sync` rule will be copied inside pods and **create-react-app** or **nodemon** will see the changed files and restart the primary processes. To stop Skaffold, use `CTRL + C`, it will delete deployments and services found in the specified folder.
