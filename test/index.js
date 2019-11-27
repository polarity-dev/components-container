const Container = require("../index.js")
const debug = require("debug")("debug")

const container = new Container({
  debugTag: "container", // override of the default debug tag; default "container"
  noColors: false // enable the console colors of the debug logs; default true
})

container
  .register(require("./components/mysql.js"), { host: "example.com" })
  .register(require("./components/products.js"))
  .init()

container.on("products.running",  async () => {
  const productsComponent = await container.get("products")

  // logging the product retrieved with the products component
  const product = productsComponent.getProduct()
  debug(product)
})

container.on("products.stopped",  async () => {
  const productsComponent = await container.get("products")

  // trying to get a product unsuccessfully because products component is stopped
  productsComponent.getProduct()
})

container.checkStatus()
  .then(debug)
  .catch(debug)
