const { STATUS } = require("../../index")

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
  init: async ({ setStatus, getStatus, options, debug }) => {

    // this is a fake mysql client
    const mysqlFakeClient = {
      options,

      // the query function fakes a mysql query and returns a fake product object
      query: fakeSql => {
        if (getStatus().status !== STATUS.RUNNING) {
          throw new Error("Can't execute query, not connected to database")
        } else {
          debug("Faking query execution:", fakeSql)
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
        debug("Connecting to database...")
        setTimeout(() => {
          if (getStatus().status !== STATUS.RUNNING) {
            debug("Connection established")
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
    if (component) {
      /*
    random switch of the component status from RUNNING to STOPPED
    and vice versa to fake ane intermittent connection
     */
      if (Math.random() > 0.5) {
        component.connect()
      } else {
        setStatus(STATUS.STOPPED, new Error("connection lost"))
      }
    }
  },

  /*
  the checkStatusInterval property is optional and is expressed in milliseconds
   */
  checkStatusInterval: 5000
}

