const { Component } = require("../index.js")

module.exports = class TestComponent extends Component {
  async init(orchestrator) {
    const client = {
      setStatusStopped: () => this.setStatus(Component.STATUS.STOPPED, new Error("Err"))
    }

    setTimeout(() => {
      this.setStatus(Component.STATUS.RUNNING)
    }, 5000)

    return client
  }

  async checkStatus(client) {
    if (Math.random() > 0.5) {
      this.setStatus(Component.STATUS.RUNNING)
    } else {
      this.setStatus(Component.STATUS.STOPPED, new Error("STOPPED"))
    }
  }
}

