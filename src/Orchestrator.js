const EventEmitter = require("events")
const { STATUS, STATUS_NAMES } = require("./Component")

const RESET_COLOR = "\x1b[0m"
const STATUS_COLORS = {
  [STATUS.REGISTERED]: "\x1b[33m", //yellow
  [STATUS.RUNNING]: "\x1b[32m", //green
  [STATUS.STOPPED]: "\x1b[31m" //red
}

class Orchestrator extends EventEmitter {
  constructor(options) {
    super()
    const {
      debug = false,
      noColors = false
    } = options

    this.components = new Map()

    if (debug) {
      this.on("statusChange", (err, status, name) => {
        // eslint-disable-next-line no-console
        console.error(`${(name + " ").padEnd(15, "-")}> ${!noColors ? STATUS_COLORS[status] : ""}${STATUS_NAMES[status]}${!noColors ? RESET_COLOR : ""}`)

        if (err) {
          // eslint-disable-next-line no-console
          console.error(err.stack)
        }
      })
    }
  }

  register(component) {
    component.orchestrator = this
    this.components.set(component.name, component)
    return component
  }

  async get(name, newInstance = false) {
    const component = this.components.get(name)

    if (!component) {
      throw new Error(`missing ${name} component`)
    }

    if (component.instance && !newInstance) {
      return component.instance
    }

    const instance = await component.init(this)

    component.instance = instance
    await component.checkStatus(instance)

    return instance
  }


  async init() {
    const componentNames = Array.from(this.components.keys())

    for (let i = 0; i < componentNames.length; i++) {
      await this.get(componentNames[i])
    }
  }

  getStatus() {
    return Array.from(this.components.values()).reduce((acc, { err, status, name }) => {
      if (acc.serving && status === STATUS.STOPPED) {
        acc.serving = false
      }

      acc.components.push({
        name,
        status,
        err
      })

      return acc
    }, {
      serving: true,
      components: []
    })
  }

  async checkStatus() {
    await Promise.all(Array.from(this.components.values()).map(component => component.checkStatus(component.instance)))

    return this.getStatus()
  }
}

module.exports = Orchestrator

