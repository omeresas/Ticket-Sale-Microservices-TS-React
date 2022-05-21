## Why do we share logic?

It turns out that a lot of the logic we need for the `tickets` service is already implemented in the `auth` service. Even if this might be an example of **microservices anti-patterns**, we will share some of the logic via **NPM registry**.

<p>
<img src="../images/67-code-sharing-1.png" alt="drawing" width=800"/>
</p>

1. We start with creating a public organization in NPM website. Go to [https://www.npmjs.com/](https://www.npmjs.com/) and a new organization.

2. Inside the project folder `ticketing`, create a new folder named `common`. Initilize npm and specify name of the npm package with your organization name such as:

```json
{
  "name": "@oetickets/common",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": { "test": "echo \"Error: no test specified\" && exit 1" },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

The `name` index inside `package.json` specifies the organization and package name we want to publish the code.

3. For us to publish it, we need to initialize git (not necessarily connected to remote GitHub) inside the folder and commit all changes. Initilize git, add changes, commit and after them:

```shell
npm login
npm publish --access public
```

Npm publishes packages as private packages by default, which requires paying money, so we need the above flag not to get errors.

4. In the future, there might be differences in our TS settings between the `common` library and other services, we wouldn't want to deal with that. In addition, some of the services might not be written in TS at all. For these reasons, **we will write the common library as TS but publish as JS.** Inside `common` folder:

```shell
tsc --init
npm i typescript del-cli --save-dev
```

5. In `package.json` include a script tag `build: "tsc"` to run tsc compiler. Also change below settings in `tsconfig.json`". The first one specifies an output folder for all emitted files while the second one generates `.d.ts` files from TS and JS files in the project.

```json
    "outDir": "./build",
    "declaration": true,
```

6. Write some very simple TS code in `src/index.ts` and try converting it into JS by `npm run build`. Expect JS code and `index.d.ts` type definition file inside `build` folder. To have clean build each time, delete previous build by:

```json
"scripts": {
    "clean": "del ./build/*",
    "build": "npm run clean && tsc"
  },
```
