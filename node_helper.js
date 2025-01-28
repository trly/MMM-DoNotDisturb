const NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function() {
    this.timer = null
    console.log("Starting node_helper for: " + this.name)
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "INIT") {
      this.startMonitoring(payload.checkInterval)
    }
  },

  startMonitoring: function(interval) {
    this.timer = setInterval(() => {
      this.sendSocketNotification("CHECK_EVENTS")
    }, interval)
  },

  stop: function() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
})
