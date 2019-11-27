const EventEmitter = require("events")
const ComponentWrapper = require("./ComponentWrapper.js")
const { STATUS, STATUS_NAMES, STATUS_COLORS } = require("./Status.js")
const Debug = require("debug")

class Container extends EventEmitter {
  static get STATUS() {
    return STATUS
  }

  static get STATUS_NAMES() {
    return STATUS_NAMES
  }

  static get STATUS_COLORS() {
    return STATUS_COLORS
  }

  static addStatus(name, value, color) {
    STATUS[name.toUpperCase()] = value
    STATUS_NAMES[value] = name.toLowerCase()
    STATUS_COLORS[value] = color
  }

  constructor({ debugTag = "container", noColors = false } = {}) {
    super()
    this.debug = Debug(debugTag)
    this.noColors = noColors
    this.wrappers = new Map()
  }

  register(componentConfig, options = {}) {
    const wrapper = new ComponentWrapper(this, componentConfig, options)
    this.wrappers.set(wrapper.name, wrapper)

    this.on(`${wrapper.name}.statusChange`, (err, status, name) => {
      this.debug(`${`${name} `.padEnd(20, "-")}> ${!this.noColors ? STATUS_COLORS[status] : ""}${STATUS_NAMES[status]}${!this.noColors ? "\x1b[0m" : ""}`)

      if (err) {
        this.debug(err.stack)
      }
    })

    return this
  }

  async get(name, newInstance = false) {
    if (!name) {
      throw new Error("Missing name argument in component.get function")
    }

    const componentWrapper = this.wrappers.get(name)

    if (!componentWrapper) {
      throw new Error(`Missing ${name} component wrapper`)
    }

    return await componentWrapper.getComponent(newInstance)
  }

  async init() {
    const wrapperNames = Array.from(this.wrappers.keys())

    for (let i = 0; i < wrapperNames.length; i++) {
      await this.get(wrapperNames[i])
    }

    return this
  }

  getStatus(name) {
    const componentWrappers = []
    if (name) {
      const wrapper = this.wrappers.get(name)

      if (!wrapper) {
        throw new Error(`missing ${name} component wrapper`)
      }

      componentWrappers.push(wrapper)
    } else {
      componentWrappers.push(...this.wrappers.values())
    }

    return componentWrappers.reduce((acc, { err, status, name }) => {
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
    await Promise.all(Array.from(this.wrappers.values()).map(wrapper => wrapper.checkStatus()))
    return this.getStatus()
  }
}

module.exports = Container
