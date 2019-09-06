const { BaseComponentWrapper } = require("../index.js")

module.exports = class TestComponentWrapper extends BaseComponentWrapper {
  async _createComponent(orchestrator) {
    const client = {
      setStatusStopped: () => this.setStatus(BaseComponentWrapper.STATUS.STOPPED, new Error("Err"))
    }

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

