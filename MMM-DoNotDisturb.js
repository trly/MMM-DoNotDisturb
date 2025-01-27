Module.register('MMM-DoNotDisturb', {
  defaults: {
    eventNotification: 'CALENDAR_EVENTS',
    message: "Do Not Disturb - Meeting in Progress",
    animationSpeed: 1000,
    calendarSet: [], 
  },

  start: function() {
    Log.info('Starting module: ' + this.name)
    this.eventPool = new Map()
    this.activeEvent = null
  },

  notificationReceived: function(notification, payload, sender) {
    if (notification === this.config.eventNotification) {
      Log.debug('Calendar event received from ' + sender.identifier)
      if (this.config.calendarSet.length === 0 || 
          this.config.calendarSet.includes(payload.calendarName)) {
        this.eventPool.set(sender.identifier, payload)
        this.updateCurrentStatus()
      }
    }
  },

  updateCurrentStatus: function() {
    const now = Date.now()
    let currentEvents = []
    
    for (const events of this.eventPool.values()) {
      const activeEvents = events.filter(event => {
        return (this.config.calendarSet.length === 0 || 
                this.config.calendarSet.includes(event.calendarName)) &&
               event.startDate <= now && 
               event.endDate >= now
      })
      currentEvents = currentEvents.concat(activeEvents)
    }
    
    const wasActive = this.activeEvent
    this.activeEvent = currentEvents.length > 0
    
    if (wasActive !== this.activeEvent) {
      Log.info(`DND Status changed to: ${this.activeEvent ? 'Active' : 'Inactive'}`)
    }
    
    this.updateDom(this.config.animationSpeed)
  },

  getDom: function() {
    const wrapper = document.createElement("div")
    
    if (this.activeEvent) {
      wrapper.innerHTML = this.config.message
      wrapper.className = "dnd-active"
    }
    
    return wrapper
  },

  getStyles: function() {
    return ["MMM-DoNotDisturb.css"]
  }
})
