const TestComponentWrapper = require("./TestComponentWrapper.js")
const Test2ComponentWrapper = require("./Test2ComponentWrapper.js")
const { ComponentsContainer } = require("../index.js")

const testComponentWrapper = new TestComponentWrapper({ name: "test", checkStatusInterval: 10000, debug: true })
const test2ComponentWrapper = new Test2ComponentWrapper({ name: "test2", checkStatusInterval: 10000, debug: true })

console.log(testComponentWrapper.getStatus())
const container = new ComponentsContainer({ debug: true })

;(async () => {
  const testComponent = await testComponentWrapper.getComponent(true)
  const test2Component = await test2ComponentWrapper.getComponent(true)

  testComponent.setStatusStopped()
  test2Component.setStatusStopped()

  console.log(testComponentWrapper.getStatus())

  container.register(testComponentWrapper)
  container.register(test2ComponentWrapper)

  await container.init()
})()
  .catch(console.error)

setInterval(() => {
  console.log(testComponentWrapper.getStatus())
}, 5000)
