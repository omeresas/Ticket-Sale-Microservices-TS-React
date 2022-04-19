## TypeScript Crash Course

- In short, TypeScript = JavaScript + type system

  - Helps us catch errors **during** development
  - Uses **type annotations** to analyze code
  - Only active during development
  - Compiles to JS, does not provide any performance enhancement

- To install TypeScript: `npm install -g typescript ts-node`. `ts-node` is a CLI tool to compile and execute TypeScript with one command, technically, TypeScript execution engine and REPL for Node.js

Instead of...

```shell
tsc index.ts
node index.js
```

...you can do

```shell
ts-node index.ts
```

- Use Prettier Code Formatter (personal preferences):

  - Run on save
  - 2 spaces for indentation
  - Double quotes

- Very Basic Type Annotation Example:

```ts
import axios from "axios";

const url = "https://jsonplaceholder.typicode.com/todos/1";

// interface from OOP
interface ToDo {
  id: number;
  title: string;
  completed: boolean;
}

axios.get(url).then((response) => {
  const todo = response.data as ToDo;

  console.log(response.data);

  const id = todo.id;
  const title = todo.title;
  const completed = todo.completed;

  logToDo(id, title, completed);
});

// signature of function, attributes and order can be checked
const logToDo = (id: number, title: string, completed: boolean) => {
  console.log(`
    The ToDo with ID: ${id},
    Has a title of: ${title},
    Is it finished?: ${completed}
  `);
};
```

- **Type annotations**: Code we add to tell TS what type of value a variable will refer to.

```ts
// Some type annotations

let apples: number = 5;
let speed: string = "fast";
let hasName: boolean = true;

let nothingMuch: null = null;
let nothing: undefined = undefined;

// built-in objects
let now: Date = new Date();

// arrays
let colors: string[] = ["red", "green", "blue"];

// classes
class Car {}
let car: Car = new Car();

// object literals
let point: { x: number; y: string } = {
  x: 10,
  y: "foo",
};

// functions: Type inference works on function return value but not on type of arguments.
// It is better to be on the safe side and specify return type too.

const add = (a: number, b: number): number => {
  return a + b;
};

// functions that returns void can return null or undefined without error
function logger(logstring: string): void {
  console.log(logstring);
}

const multiply = function (a: number, b: number): number {
  return a * b;
};

// when we never expect the function to complete
const throwError = (message: string): never => {
  throw new Error(message);
};

// if we expect it to return some value
const mayThrowError = (message: string): string => {
  if (!message) {
    throw new Error(message);
  }

  return message;
};
```

- **Type inference**: TS tries to figure out what type of value a variable refers to.

```ts
// When does the type inference work?

// When declaration and initialization is done at the same time
let apples = 5; // apples will be of type "number"

let oranges; // oranges will be of type "any"
oranges = 10;
```

- When to use annotations?

```ts
// 1) Functions that return the "any" type
const json = '{"x": 10, "y": 20}';
const coordinates: { x: number; y: number } = JSON.parse(json);

// coordinates.z gives error

// 2) Declare a variable and initialize later
let words = ["red", "green", "blue"];
let foundWord: boolean;

for (let i = 0; i < words.length; i++) {
  if (words[i] === "red") {
    foundWord = true;
  }
}

// 3) Variables whose types cannot be inferred correctly
let numbers = [-10, -2, 15];
let numberAboveZero: boolean | number = false;

for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] > 0) {
    numberAboveZero = numbers[i];
  }
}
```

- Destructuring with TS:

```ts
// type destructuring with TS
const todaysWeather = {
  date: new Date(),
  weather: "sunny",
};

// first method without destructuring
const firstLogWeather = (forecast: { date: Date; weather: string }) => {
  console.log(forecast.date);
  console.log(forecast.weather);
};

// second method with TS similar to ES2015
// list different properties you want to pull out of the object like normal destructuring
// then add the annotations
const secondLogWeather = ({
  date,
  weather,
}: {
  date: Date;
  weather: string;
}) => {
  console.log(date);
  console.log(weather);
};

secondLogWeather(todaysWeather);
```
