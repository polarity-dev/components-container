const EventEmitter = require("events")

class Component extends EventEmitter {
  static get STATUS() {
    return {
      REGISTERED: 0,
      RUNNING: 1,
      STOPPED: 2
    }
  }

  static get STATUS_NAMES() {
    return {
      0: "registered",
      1: "running",
      2: "stopped"
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

    ;[Component.STATUS_NAMES[status], "statusChange"].forEach(event => {
      this.emit(event, this.err, this.status, this.name)
      if (this.orchestrator) {
        this.orchestrator.emit(event, this.err, this.status, this.name)
      }
    })
  }

  constructor({ name, checkStatusInterval }) {
    super()
    this.name = name ? name : this.constructor.name.toLowerCase()
    this.setStatus(Component.STATUS.REGISTERED)
    this.instance = null
    this.orchestrator = null

    if (checkStatusInterval) {
      setInterval(() => this.checkStatus(this.instance), checkStatusInterval * 60 * 1000)
    }
  }

  async checkStatus(instance) {}

  async init() {}
}

module.exports = Component

