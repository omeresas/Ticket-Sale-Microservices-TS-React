## Setup client, posts and comments apps

### Initialize Git repository and connect it to GitHub:

1. Inside `mini-blog-app`, initialize Git repository:

```shell
git init -y
```

2. Create `.gitignore` file.
3. Add `.gitignore` and other files:

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

7. Push the commit in the local branch named `master` to the remote named `origin`, also use `-u` flag, which is short for `git branch --set-upstream master origin/master`, specifying the source remote when you do a `git pull`:

```shell
git push -u origin master
```

### Initilize client React app:

1. Inside `mini-blog-app`, create a React app named `client`.

```shell
npx create-react-app client
```

### Initilize posts Express app:

1. Inside `mini-blog-app`, create a folder named `posts` and enter into it:

```shell
mkdir posts
cd posts
```

2. Generate `package.json` file and install the four dependecies below:

```shell
npm init -y
npm install express cors axios nodemon
```

### Initilize comments Express app:

1. Go back to `mini-blog-app` folder and do the same for `comments` app:

```shell
cd ..
mkdir comments
cd comments
npm init -y
npm install express cors axios nodemon
```
