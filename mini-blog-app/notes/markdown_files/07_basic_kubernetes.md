## Learning Kubernetes Terminology

- `K8s Cluster`: A collections of nodes + a master to manage them
- `Node`: A virtual machine that will run our containers
- `Pod`: _More or less_ a running container; technicall, a pod can run multiple containers but we won't do this
- `Deployment`: Monitors a set of pods, makes sure they are running and restarts them if they crash
- `Service`: Provides an easy-to-remember URL to access a running container

## Creating a Pod for Posts service

1. Create K8s config .yaml file for the `posts` service.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: posts
spec:
  containers:
    - name: posts
      image: oesasdocker/posts:0.0.1
      imagePullPolicy: Never
```

2. Apply the config file in its folder by:

```shell
kubectl apply -f posts.yaml
```

### Understanding a Pod Spec
