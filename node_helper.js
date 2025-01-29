const NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function() {
    this.timer = null
    this.eventPool = new Map()
    this.activeEvent = false
    Log.log(`Starting node helper for: ${this.name}`);
  },

  socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "INIT":
        Log.debug(`${this.name}: Received INIT notification with interval ${payload.checkInterval}ms`)
        this.config = payload
        this.startMonitoring(payload.checkInterval)
        break
      case "UPDATE_EVENTS":
        this.eventPool.set(payload.sender, payload.events)
        this.updateCurrentStatus()
        break
    }
  },

  startMonitoring: function(interval) {
    Log.log(`${this.name}: Starting event monitoring every ${interval}ms`)
    this.timer = setInterval(() => {
      this.updateCurrentStatus()
    }, interval)
  },

  updateCurrentStatus: function() {
    const now = Date.now()
    let currentEvents = []
    
    for (const events of this.eventPool.values()) {
      const activeEvents = events.filter(event => {
        return (this.config.calendarSet.length === 0 || 
                this.config.calendarSet.includes(event.calendarName)) &&
               ((event.startDate <= now && event.endDate >= now) ||
                (this.config.includeFullDayEvents && event.fullDayEvent))
      })
      currentEvents = currentEvents.concat(activeEvents)
    }
    
    const wasActive = this.activeEvent
    this.activeEvent = currentEvents.length > 0
    
    if (wasActive !== this.activeEvent) {
      Log.log(`${this.name}: DND Status changed to: ${this.activeEvent ? 'Active' : 'Inactive'}`)
      this.sendSocketNotification("STATUS_CHANGED", {
        active: this.activeEvent,
        eventCount: currentEvents.length
      })
    }
  },

  stop: function() {
    Log.log(`Stopping node helper for: ${this.name}`);
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
})
