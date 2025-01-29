const NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function() {
    this.timer = null
    console.log("Starting node_helper for: " + this.name)
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "INIT") {
      console.log(`${this.name}: Received INIT notification with interval ${payload.checkInterval}ms`)
      this.startMonitoring(payload.checkInterval)
    }
  },

  startMonitoring: function(interval) {
    console.log(`${this.name}: Starting event monitoring with ${interval}ms interval`)
    this.timer = setInterval(() => {
      console.log(`${this.name}: Checking events...`)
      this.sendSocketNotification("CHECK_EVENTS")
    }, interval)
  },

  stop: function() {
    if (this.timer) {
      console.log("Stopping node_helper for: " + this.name)
      clearInterval(this.timer)
    }
  }
})
