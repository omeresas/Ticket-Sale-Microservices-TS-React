## Learning Kubernetes Terminology

- `K8s Cluster`: A collections of nodes + a master to manage them
- `Node`: A virtual machine that will run our containers
- `Pod`: _More or less_ a running container; technicall, a pod can run multiple containers but we won't do this
- `Deployment`: Monitors a set of pods, makes sure they are running and restarts them if they crash
- `Service`: Provides an easy-to-remember URL to access a running container

## Creating a Pod for Posts Service

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

- `apiVersion: v1`: K8s is extensible. We can add in our own custom objects. This specifies the set of objects we want K8s to look at.
- `kind: Pod`: The type of K8s object we want to create.
- `metadata`: Metadata for the object to be created.
- `spec`: Exact attributes we want to apply to the object we are going to create.
- `name: posts`: Metadata for the container inside the pod.
- `image: oesasdocker/posts`: Image to instantiate.
- `imagePullPolicy: Never`: kubelet (primary node agent) does not try fetching the image.

## Learning Basic Kubectl Commands

For full Kubectl reference: [https://docs.docker.com/engine/reference/run/](https://docs.docker.com/engine/reference/run/).

1. Print out information about all running pods:

```shell
kubectl get pods
```

2. Execute the given command in a running pod, with stdin and tty:

```shell
kubectl exec -it POD CMD
```

3. Print out logs from a given pod:

```shell
kubectl logs POD
```

4. Delete a K8s object:

```shell
kubectl delete (FILENAME) | (TYPE NAME)
```

Delete a running pod:

```shell
kubectl delete pod NAME
```

5. Tell K8s to process the config:

```shell
kubectl apply -f FILENAME
```

6. Print out some info about running pod:

```shell
kubectl describe pod NAME
```
