const { STATUS, STATUS_COLORS, STATUS_NAMES } = require("./Status.js")

const RESET_COLOR = "\x1b[0m"

class ComponentWrapper {
  constructor(container, {
    name,
    init,
    checkStatus,
    checkStatusInterval = 5 /*minutes*/ * 60000,
    debug = container.debug,
    noColors = container.noColors
  }) {
    if (!name || typeof name !== "string") {
      throw new Error("Missing name property in component configuration object")
    }

    if (!init || typeof init !== "function") {
      throw new Error(`Missing init function in ${name} component configuration object`)
    }

    this.container = container
    this.init = init
    this.checkStatus = checkStatus
    this.name = name
    this.status = STATUS.UNINITIALIZED
    this.component = null
    this.err = null

    if (debug) {
      container.on(`${name}.statusChange`, (err, status, name) => {
        // eslint-disable-next-line no-console
        console.error(`${(name + " ").padEnd(15, "-")}> ${!noColors ? STATUS_COLORS[status] : ""}${STATUS_NAMES[status]}${!noColors ? RESET_COLOR : ""}`)

        if (err) {
          // eslint-disable-next-line no-console
          console.error(err.stack)
        }
      })
    }

    if (checkStatus && checkStatusInterval) {
      setInterval(async () => {
        if (this.component) {
          return await checkStatus(this.wrapperReferences)
        }
      }, checkStatusInterval)
    }
  }

  get wrapperReferences() {
    return {
      name: this.name,
      container: this.container,
      component: this.component,
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
      return this.component
    }
  }
}

module.exports = ComponentWrapper

