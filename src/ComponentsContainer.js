const EventEmitter = require("events")
const { STATUS } = require("./BaseComponentWrapper")

class ComponentsContainer extends EventEmitter {
  constructor() {
    super()
    this.wrappers = new Map()
  }

  register(componentWrapper) {
    componentWrapper.container = this
    this.wrappers.set(componentWrapper.name, componentWrapper)
    return this
  }

  async getComponent(name, newInstance = false) {
    const componentWrapper = this.wrappers.get(name)

    if (!componentWrapper) {
      throw new Error(`missing ${name} component wrapper`)
    }

    return await componentWrapper.getComponent(newInstance)
  }

  async init() {
    const wrapperNames = Array.from(this.wrappers.keys())

    for (let i = 0; i < wrapperNames.length; i++) {
      await this.getComponent(wrapperNames[i])
    }
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
    await Promise.all(Array.from(this.wrappers.values()).map(wrapper => wrapper.checkStatus(wrapper.getComponent())))

    return this.getStatus()
  }
}

module.exports = ComponentsContainer
