Module.register('MMM-DoNotDisturb', {
  requiresVersion: "2.30.0",
  
  defaults: {
    eventNotification: 'CALENDAR_EVENTS',
    message: "Do Not Disturb",
    animationSpeed: 1000,
    calendarSet: [],
    checkInterval: 60 * 1000,
    includeFullDayEvents: false
  },

  start: function() {
    Log.info('Starting module: ' + this.name)
    this.activeEvent = false
    this.sendSocketNotification("INIT", {
      checkInterval: this.config.checkInterval,
      calendarSet: this.config.calendarSet,
      includeFullDayEvents: this.config.includeFullDayEvents
    })
  },

  notificationReceived: function(notification, payload, sender) {
    if (notification === this.config.eventNotification) {
      Log.debug(`${this.name}: Received calendar events from ${sender.identifier}:`, payload)
      
      if (this.config.calendarSet.length === 0 || 
          this.config.calendarSet.includes(payload.calendarName)) {
        Log.debug(`${this.name}: Adding events from calendar ${payload.calendarName}`)
        this.sendSocketNotification("UPDATE_EVENTS", {
          sender: sender.identifier,
          events: payload
        })
      }
    }
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "STATUS_CHANGED") {
      Log.debug(`${this.name}: Received status change: active=${payload.active}`)
      this.activeEvent = payload.active
      this.updateDom(this.config.animationSpeed)
    }
  },

  getDom: function() {
    const wrapper = document.createElement("div")
    
    if (this.activeEvent) {
      Log.debug(`${this.name}: Rendering DND message: ${this.config.message}`)
      wrapper.innerHTML = this.config.message
      wrapper.className = "dnd-active"
    }
    
    return wrapper
  },

  getStyles: function() {
    return ["MMM-DoNotDisturb.css"]
  }
})
