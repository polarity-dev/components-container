const { BaseComponentWrapper } = require("../index.js")

module.exports = class Test2ComponentWrapper extends BaseComponentWrapper {
  async _createComponent(container) {
    const client = {
      setStatusStopped: () => this.setStatus(BaseComponentWrapper.STATUS.STOPPED, new Error("Err"))
    }

    setInterval(() => {
      if (this.container) {
        console.log("Other component status:", this.container.getStatus("test"))
      }
    }, 1000)

    setTimeout(() => {
      this.setStatus(BaseComponentWrapper.STATUS.RUNNING)
    }, 5000)

    return client
  }

  async checkStatus(client) {
    if (Math.random() > 0.5) {
      this.setStatus(BaseComponentWrapper.STATUS.RUNNING)
    } else {
      this.setStatus(BaseComponentWrapper.STATUS.STOPPED, new Error("STOPPED"))
    }
  }
}

