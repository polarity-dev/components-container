import { STATUS, STATUS_COLORS, STATUS_NAMES } from "./Status"
import Container from './Container'
import Debug from "debug"

export type WrapperReferences = {
  name: string,
  container: Container,
  component: any
  options: Options
  setStatus: (status: number, err?: Error | null) => void
  getStatus: () => {}
  debug: debug.Debugger
}

export type ComponentConfig = {
  name: string
  init: (wrapperReferences: WrapperReferences) => any
  checkStatus?: (wrapperReferences?: WrapperReferences) => Promise<void>
  checkStatusInterval?: number
  debugTag?: string
}

export type Options = {
  [key: string]: any
}

export default class ComponentWrapper {
  debug: debug.Debugger
  container: Container
  component: any
  name: ComponentConfig["name"]
  init: ComponentConfig["init"]
  checkStatus: ComponentConfig["checkStatus"]
  checkStatusInterval: ComponentConfig["checkStatusInterval"]
  debugTag: ComponentConfig["debugTag"]
  status: number
  err: Error | null
  options: Options

  constructor(container: Container, {
    name,
    init,
    checkStatus,
    checkStatusInterval,
    debugTag
  }: ComponentConfig, options: Options) {

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

    if (checkStatus) {
      this.checkStatus = async () => {
        if (this.status !== STATUS.UNINITIALIZED) {
          return checkStatus(this.wrapperReferences)
        }
      }

      if (checkStatusInterval) {
        setInterval(async () => {
          return await this.checkStatus!(this.wrapperReferences)
            .catch(this.debug)
        }, checkStatusInterval)
      }
    } else {
      this.checkStatus = async () => {}
    }
  }

  get wrapperReferences(): WrapperReferences {
    return {
      name: this.name,
      container: this.container,
      component: this.component,
      options: this.options,
      setStatus: (status: number, err: Error | null = null) => this.setStatus(status, err),
      getStatus: () => this.getStatus(),
      debug: this.debug
    }
  }

  getStatus() {
    return {
      status: this.status,
      err: this.err
    }
  }

  setStatus(status: number, err: Error | null = null) {
    if (this.status === status) {
      return
    }

    this.status = status
    this.err = err || null

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
      this.checkStatus!()
      return this.component
    }
  }
}
