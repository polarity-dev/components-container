# components-container

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Gandalf Status][gandalf-image]][gandalf-url]

Easy and clean way to manage async and sync components in simple and complex projects.

## Getting Started

### Installing

In your project run
```shell
$ npm install @soluzionifutura/components-container
```

### The design pattern

The `components-container` design pattern is inspired from [PHP Slim's Dependecy Container](http://www.slimframework.com/docs/v3/concepts/di.html).
You have a higher order container that handles multiple components and manage to grant 
communication between them.
You can consider a `component` every configured SDK, client or abstraction that allow your project to use a service or to accomplish certain operations.

### Usage

```javascript
const Container = require("components-container")
const mysqlComponent = require("./components/mysqlComponent.js")
const productsComponent = require("./components/productsComponent.js")

const container = new Container({
  debug: true, // enable the debug logs
  noColors: false // enable the console colors of the debug logs
})

container
  .register(mysqlComponent)
  .register(productsComponent)
  .init()
```

### Component definition
```javascript
module.exports = {
  /*
  the name property is required and represents the component handler
   */
  name: "component-name",

  /*
  the init async function is required and must return whatever you
  need to retrieve with the container get function
   */
  init: async ({ setStatus, getStatus, container }) => {
    
    // ...

    return client
  },

  /*
  the checkStatusInterval property is optional and is expressed in milliseconds
   */
  checkStatusInterval: 5000,

  /*
  the checkStatus function is optional and will be called every checkStatusInterval
   */
  checkStatus: async ({ component, setStatus }) => {
    // ...
    setStatus(STATUS.STOPPED, new Error("connection lost"))
  },

  /*
  the debug option overrides the container debug option
   */
  debug: true,

  /*
  the noColors option overrides the container debug option
   */
  noColors: false
}
```

### Events

`components-container` emits various events to fully control and customize how your application must react to status changes.
Every status change inside a component will emit an event `<component-name>.<new-status>`.
You can easily subscribe to these changes:
```javascript
container.on("products.running",  async () => {
  // ...
}
```

### Components retrieval
You can use the `Container` instance to easily retrieve init function return value of each component.
```javascript
const mysqlClient = await container.get("mysql-component")
```

## Example

### Fake mysql component

#### mysql-component.js
```javascript
const { STATUS } = require("components-container")


/*
this is the mysql component definition:

there are 2 required fields:
- name
- init

and 4 optional:
- checkStatusInterval
- checkStatus
- debug
- noColors
 */

module.exports = {
  /*
  the name property is required and represents the component handler
   */
  name: "mysql",

  /*
  the init async function is required and must return whatever you
  need to retrieve with the container get function
   */
  init: async ({ setStatus, getStatus, options }) => {

    // this is a fake mysql client
    const mysqlFakeClient = {
      options,

      // the query function fakes a mysql query and returns a fake product object
      query: fakeSql => {
        if (getStatus().status !== STATUS.RUNNING) {
          throw new Error("Can't execute query, not connected to database")
        } else {
          console.log("Faking query execution:", fakeSql)
          return {
            product: {
              id: 123,
              name: "pizza",
              price: 10
            }
          }
        }
      },

      // the connect function fakes the connection to the database
      connect: () => {
        console.log("Connecting to database...")
        setTimeout(() => {
          if (getStatus().status !== STATUS.RUNNING) {
            console.log("Connection established")
            setStatus(STATUS.RUNNING)
          }
        }, 500)
      }
    }

    mysqlFakeClient.connect()

    return mysqlFakeClient
  },

  /*
  the checkStatus function is optional and will be called every checkStatusInterval
   */
  checkStatus: async ({ component, setStatus }) => {
    /*
    random switch of the component status from RUNNING to STOPPED
    and vice versa to fake ane intermittent connection
     */
    if (Math.random() > 0.5) {
      component.connect()
    } else {
      setStatus(STATUS.STOPPED, new Error("connection lost"))
    }
  },

  options: {
    /*
    the checkStatusInterval property is optional and is expressed in milliseconds
     */
    checkStatusInterval: 5000,

    /*
    the debug option overrides the container debug option
     */
    debug: true,

    /*
    the noColors option overrides the container debug option
     */
    noColors: false
  }
}
```

#### index.js
```javascript
const Container = require("components-container")

const container = new Container({
  debug: true, // enable the debug logs
  noColors: false // enable the console colors of the debug logs
})

container
  .register(require("./components/mysql.js"), { host: "example.com" })
  .register(require("./components/products.js"))
  .init()
```

## Development

### Running the tests

You can run tests running:
```shell
$ npm run test
```

## Authors

* **Giovanni Bruno** - [giowe](https://github.com/giowe)
* **Nicolò Fuccella** - [nicofuccella](https://github.com/nicofuccella)

See also the list of [contributors](https://github.com/soluzionifutura/components-container/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[npm-image]: https://img.shields.io/npm/v/@soluzioni-futura/components-container.svg
[npm-url]: https://npmjs.org/package/@soluzioni-futura/components-container
[downloads-image]: https://img.shields.io/npm/dm/@soluzioni-futura/components-container.svg
[downloads-url]: https://npmjs.org/package/@soluzioni-futura/components-container
[gandalf-image]: http://img.shields.io/badge/gandalf-approved-61C6FF.svg
[gandalf-url]: https://www.youtube.com/watch?v=Sagg08DrO5U
