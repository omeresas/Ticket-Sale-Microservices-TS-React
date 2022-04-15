## Learning basic Docker commands

For full Docker CLI reference: [https://docs.docker.com/engine/reference/run/](https://docs.docker.com/engine/reference/run/).
The amount of Docker that you need is summarised below:

1. Create a container. The `docker create` command creates a writeable container layer over the specified image and prepares it for running the specified command.

```shell
docker create [OPTIONS] IMAGE [COMMAND] [ARG...]
docker create hello-world
```

2. Start one or more container, use `-a` to attach STDOUT/STDERR.

```shell
docker start [OPTIONS] CONTAINER [CONTAINER...]
```

3. Run a command in a new container. The `docker run` command first creates a writeable container layer over the specified image, and then starts it using the specified command.

```shell
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
docker run busybox ping google.com
```

4. List running containers, use `--all` to list all.

```shell
docker ps
```

5. Remove unused data (stopped containers, not used networks, dangling images, build cache).

```shell
docker system prune [OPTIONS]
```

6. Fetch the logs of a container.

```shell
docker logs [OPTIONS] CONTAINER
```

7. Stop one or more running containers. The main process inside the container will receive `SIGTERM`, and after a grace period, `SIGKILL`. The first signal can be changed with the `STOPSIGNAL` instruction in the container’s Dockerfile, or the `--stop-signal` option to docker run.

```shell
docker stop [OPTIONS] CONTAINER [CONTAINER...]
```

8. Kill one or more running containers. The `docker kill` subcommand kills one or more containers. The main process inside the container is sent `SIGKILL` signal (default), or the signal that is specified with the `--signal` option. You can reference a container by its ID, ID-prefix, or name.

```shell
docker kill [OPTIONS] CONTAINER [CONTAINER...]
```

9. Run a command in a running container. `COMMAND` should be an executable, a chained or a quoted command will not work. Example: `docker exec -ti my_container "echo a && echo b"` will not work, but `docker exec -ti my_container sh -c "echo a && echo b"` will. Use `-i` (interactive) to keep STDIN open even if not attached, and `-t` to allocate a pseudo-TTY that makes the output look nicer and do some other stuff.

```shell
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

To get a command prompt (sh, bash, powershell or zsh, depending on which program is available in container) inside a running container, `CTRL + D` or `exit` to get out:

```shell
docker exec -it CONTAINER sh
```

To override the default command of image and get a commant prompt as you begin running a container:

```shell
docker run -it IMAGE sh
```

10. Create a Docker image from a Dockerfile. Specify base image, specify commands to be run, specify argument to `cmd`. [The full reference to Dockerfiles](https://docs.docker.com/engine/reference/builder/)

```Dockerfile
FROM alpine
RUN apk add --update redis
CMD ["redis-server"]
```

Run `docker build`

```shell
docker build [OPTIONS] PATH | URL | -
```

Use `-t` to tag the image: DOCKERID / REPO | PROJECTNAME : VERSION

```shell
docker build -t oesasdocker/my-dockerised-project:latest .
```

Then you can use the tag to run a container with that image, latest by default:

```shell
docker run oesasdocker/my-dockerised-project
```

11. Create a new image from a container’s changes using `docker commit`

```shell
docker run -it alpine sh
apk add --update redis
```

In another terminal, find the container ID and commit:

```shell
docker ps
docker commit -c 'CMD ["redis-server"]' CONTAINER
```

12. In the Docker world, `alpine` version means it is the most compact fomr of that program, with no additional bunch of programs installed. E.g.: `node:alpine` base image.

## Dockerizing the posts service

1. Create Dockerfile as shown below, pay attention to intermediary images by installing dependencies first and then copying assets so that build image cache is not busted.

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]
```

2. Build the image with tag `oesasdocker/posts`

```shell
docker build -t oesasdocker/posts .
```

Output will be like:

```shell
 => => writing image sha256:bb3c0a2c24fc46c7e315decf33a912d004f3  0.0s
 => => naming to docker.io/oesasdocker/posts                      0.0s
```

3. Push the image to Docker Hub:

```shell
docker push docker.io/oesasdocker/posts
```

## Dockerizing other services

Do the same for other services as well.
