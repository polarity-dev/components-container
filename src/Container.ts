import { EventEmitter } from "events"
import ComponentWrapper, { ComponentConfig, Options } from "./ComponentWrapper"
import { STATUS, STATUS_NAMES, STATUS_COLORS } from "./Status"
import Debug from "debug"

export default class Container extends EventEmitter {
  debug: debug.Debugger
  noColors: boolean
  wrappers: Map<string, ComponentWrapper>

  static get STATUS() {
    return STATUS
  }

  static get STATUS_NAMES() {
    return STATUS_NAMES
  }

  static get STATUS_COLORS() {
    return STATUS_COLORS
  }

  static addStatus(name: string, value: number, color: string) {
    STATUS[name.toUpperCase()] = value
    STATUS_NAMES[value] = name.toLowerCase()
    STATUS_COLORS[value] = color
  }

  constructor({ debugTag = "container", noColors = false }: { debugTag?: string, noColors?: boolean } = {}) {
    super()
    this.debug = Debug(debugTag)
    this.noColors = noColors
    this.wrappers = new Map()
  }

  register(componentConfig: ComponentConfig, options: Options = {}) {
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

  async get(name: string, newInstance: boolean = false) {
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

  getStatus(name: string | null = null) {
    const componentWrappers: ComponentWrapper[] = []

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
    } as { serving: boolean, components: { name: string, status: number, err: Error | null }[] })
  }

  async checkStatus() {
    await Promise.all(Array.from(this.wrappers.values()).map(wrapper => wrapper.checkStatus!()))
    return this.getStatus()
  }
}
