const EventEmitter = require("events")

const RESET_COLOR = "\x1b[0m"

class BaseComponentWrapper extends EventEmitter {
  static get STATUS() {
    return {
      UNINITIALIZED: 0,
      INITIALIZED: 1,
      RUNNING: 2,
      STOPPED: 3
    }
  }

  static get STATUS_COLORS() {
    return {
      [BaseComponentWrapper.STATUS.UNINITIALIZED]: "\x1b[37m", //white
      [BaseComponentWrapper.STATUS.INITIALIZED]: "\x1b[33m", //yellow
      [BaseComponentWrapper.STATUS.RUNNING]: "\x1b[32m", //green
      [BaseComponentWrapper.STATUS.STOPPED]: "\x1b[31m" //red
    }
  }

  static get STATUS_NAMES() {
    return {
      0: "uninitialized",
      1: "initialized",
      2: "running",
      3: "stopped"
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

    ;[BaseComponentWrapper.STATUS_NAMES[status], "statusChange"].forEach(event => {
      this.emit(event, this.err, this.status, this.name)
      if (this.container) {
        this.container.emit(event, this.err, this.status, this.name)
      }
    })
  }

  constructor({ name, checkStatusInterval, debug = false, noColors = false }) {
    super()
    this.name = name ? name : this.constructor.name.toLowerCase()
    this.status = BaseComponentWrapper.STATUS.UNINITIALIZED
    this.err = null

    if (debug) {
      this.on("statusChange", (err, status, name) => {
        // eslint-disable-next-line no-console
        console.error(`${(name + " ").padEnd(15, "-")}> ${!noColors ? BaseComponentWrapper.STATUS_COLORS[status] : ""}${BaseComponentWrapper.STATUS_NAMES[status]}${!noColors ? RESET_COLOR : ""}`)

        if (err) {
          // eslint-disable-next-line no-console
          console.error(err.stack)
        }
      })
    }

    this.component = null
    this.container = null

    if (checkStatusInterval) {
      setInterval(async () => {
        if (this.component) {
          return await this.checkStatus(this.component)
        }
      }, checkStatusInterval)
    }
  }

  async getComponent(newInstance = false) {
    if (!newInstance && this.component) {
      return this.component
    } else {
      this.setStatus(BaseComponentWrapper.STATUS.INITIALIZED)
      this.component = await this._createComponent(this.container)
      return this.component
    }
  }

  async checkStatus(component) {}

  async _createComponent() {}
}

module.exports = BaseComponentWrapper

