const { STATUS, STATUS_COLORS, STATUS_NAMES } = require("./Status.js")
const Debug = require("debug")

const RESET_COLOR = "\x1b[0m"

class ComponentWrapper {
  constructor(container, {
    name,
    init,
    checkStatus,
    checkStatusInterval,
    debugTag
  }, options) {

    name = options.name || name
    checkStatusInterval = options.checkStatusInterval || checkStatusInterval || 5 /*minutes*/ * 60000

    if (!name || typeof name !== "string") {
      throw new Error("Missing name property in component configuration object")
    }

    if (!init || typeof init !== "function") {
      throw new Error(`Missing init function in ${name} component configuration object`)
    }

    debugTag = options.debugTag || debugTag

    this.debug = Debug(debugTag || name)
    this.container = container
    this.init = init
    this.name = name
    this.status = STATUS.UNINITIALIZED
    this.component = null
    this.err = null
    this.options = options

    container.on(`${name}.statusChange`, (err, status, name) => {
      this.container.debug(`${`${name} `.padEnd(20, "-")}> ${!this.container.noColors ? STATUS_COLORS[status] : ""}${STATUS_NAMES[status]}${!this.container.noColors ? RESET_COLOR : ""}`)

      if (err) {
        this.container.debug(err.stack)
      }
    })

    if (checkStatus) {
      this.checkStatus = async () => {
        if (this.status !== STATUS.UNINITIALIZED) {
          return checkStatus(this.wrapperReferences)
        }
      }

      if (checkStatusInterval) {
        setInterval(async () => {
          return await this.checkStatus(this.wrapperReferences)
            .catch(this.debug)
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
      getStatus: (...args) => this.getStatus(...args),
      debug: this.debug
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

