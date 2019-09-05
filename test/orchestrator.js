const { Orchestrator } = require("../index.js")
const TestComponent = require("./component.js")

const orchestrator = new Orchestrator({
  debug: true
})

;(async () => {
  const testComponent = new TestComponent({ name: "test", checkStatusInterval: 5 })

  orchestrator.register(testComponent)

  await orchestrator.init()
})()
  .catch(console.error)

setInterval(() => {
  orchestrator.checkStatus().then(console.log)
}, 5000)
