### Initialize Git repository and connect it to GitHub:

1. Inside `mini-blog-app`, initialize Git repository:

```shell
git init -y
```

2. Create .gitignore file.
3. Add .gitignore and other files:

```shell
git add .gitignore
```

4. Commit your first commit:

```shell
git commit -m "initial commit"
```

5. Create a new GitHub repository.
6. Create a new remote called `origin`, located at `git@github.com:omeresas/nodejs-microservices.git`, so that you can push to `origin` without typing the whole URL:

```shell
git remote add origin git@github.com:omeresas/nodejs-microservices.git
```

7. Push the commit in the local branch named `master` to the remote named `origin`, also use `-u`, which is short for `git branch --set-upstream master origin/master`, specifying the source remote when you do a `git pull`.

```shell
git push -u origin master
```

### Initilize Client app:

1. Inside `mini-blog-app`, create a react app named `client`.

```shell
npx create-react-app client
```
