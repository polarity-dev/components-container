const { STATUS } = require("../../index")

/*
this is the mysql component definition:
 */
module.exports = {
  name: "products",

  init: async ({ container, setStatus }) => {
    // retrieving the mysqlFakeClient
    const mysqlFakeClient = await container.get("mysql")

    // this is the fake product component
    const productsComponent = {

      /*
      the getProduct function uses the mysql fake client to
      simulate the retrieval of a product and returns it
       */
      getProduct: () => {
        console.log("Getting product...")
        try {
          const product = mysqlFakeClient.query("SELECT * FROM PRODUCTS WHERE `id` = 123")
          return product
        } catch (err) {
          return err
        }
      }
    }

    /*
    the status of the products component is tightly coupled with the status
    of the mysql component: in fact, in order to work properly, we assume
    that the products component requires the mysql fake component to perform
    query on the database;
    for this reason, the status of the products component will change when
    the container emits any variation of the mysql component status
     */
    container.on("mysql.statusChange", (err, status) => {
      if (err) {
        setStatus(STATUS.STOPPED, "Products component stopped because mysql component is not running")
      } else if (status === STATUS.RUNNING) {
        setStatus(STATUS.RUNNING)
      }
    })

    return productsComponent
  }
}

