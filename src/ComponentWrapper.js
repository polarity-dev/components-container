const { STATUS, STATUS_COLORS, STATUS_NAMES } = require("./Status.js")

const RESET_COLOR = "\x1b[0m"

class ComponentWrapper {
  constructor(container, {
    name,
    init,
    checkStatus,
    checkStatusInterval,
    options,
  }) {

    name = options.name || name
    checkStatusInterval = options.checkStatusInterval || checkStatusInterval || 5 /*minutes*/ * 60000

    if (!name || typeof name !== "string") {
      throw new Error("Missing name property in component configuration object")
    }

    if (!init || typeof init !== "function") {
      throw new Error(`Missing init function in ${name} component configuration object`)
    }

    this.container = container
    this.init = init
    this.name = name
    this.status = STATUS.UNINITIALIZED
    this.component = null
    this.err = null
    this.options = options

    const { debug, noColors } = options

    if (debug) {
      container.on(`${name}.statusChange`, (err, status, name) => {
        // eslint-disable-next-line no-console
        console.log(`${(name + " ").padEnd(15, "-")}> ${!noColors ? STATUS_COLORS[status] : ""}${STATUS_NAMES[status]}${!noColors ? RESET_COLOR : ""}`)

        if (err) {
          // eslint-disable-next-line no-console
          console.log(err.stack)
        }
      })
    }

    if (checkStatus) {
      this.checkStatus = async () => {
        if (this.status !== STATUS.UNINITIALIZED) {
          return checkStatus(this.wrapperReferences)
        }
      }

      if (checkStatusInterval) {
        setInterval(async () => {
          if (this.component) {
            return await this.checkStatus(this.wrapperReferences)
              .catch(console.error)
          }
        }, checkStatusInterval)
      }
    } else {
      this.checkStatus = async () => {}
    }
  }

  get wrapperReferences() {
    return {
      name: this.name,
      container: this.container,
      component: this.component,
      options: this.options,
      setStatus: (...args) => this.setStatus(...args),
      getStatus: (...args) => this.getStatus(...args)
    }
  }

  getStatus() {
    return {
      status: this.status,
      err: this.err
    }
  }

  setStatus(status, err = null) {
    if (this.status === status) {
      return
    }

    this.status = status
    this.err = err

    ;[STATUS_NAMES[status], "statusChange"].forEach(event => {
      this.container.emit(event, this.err, this.status, this.name)
      this.container.emit(`${this.name}.${event}`, this.err, this.status, this.name)
    })
  }

  async getComponent(newInstance = false) {
    if (!newInstance && this.component) {
      return this.component
    } else {
      this.setStatus(STATUS.INITIALIZED)
      this.component = await this.init(this.wrapperReferences)
      this.checkStatus()
      return this.component
    }
  }
}

module.exports = ComponentWrapper

