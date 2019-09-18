const EventEmitter = require("events")
const ComponentWrapper = require("./ComponentWrapper.js")
const { STATUS, STATUS_NAMES, STATUS_COLORS } = require("./Status.js")

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

  constructor({ debug = false, noColors = false }) {
    super()
    this.debug = debug
    this.noColors = noColors
    this.wrappers = new Map()
  }

  register(componentConfig, options) {
    componentConfig.options = Object.assign({
      debug: this.debug,
      noColors: this.noColors,
      checkStatusInterval: 5 /*minutes*/ * 60000
    }, componentConfig.options, options)
    const wrapper = new ComponentWrapper(this, componentConfig)
    this.wrappers.set(wrapper.name, wrapper)
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
