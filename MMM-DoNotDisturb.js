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
    this.eventPool = new Map()
    this.activeEvent = null
    this.updateDom()
  },

  notificationReceived: function(notification, payload, sender) {
    if (notification === this.config.eventNotification) {
      Log.debug(`${this.name}: Received calendar events from ${sender.identifier}:`, payload)
      
      if (this.config.calendarSet.length === 0 || 
          this.config.calendarSet.includes(payload.calendarName)) {
        Log.debug(`${this.name}: Adding events from calendar ${payload.calendarName}`)
        this.eventPool.set(sender.identifier, payload)
      } else {
        Log.debug(`${this.name}: Skipping events from calendar ${payload.calendarName} - not in calendarSet`)
      }
    }
  },

  getDom: function() {
    const dom = document.createElement("div")
    const wasActive = this.activeEvent
    const now = Date.now()
    let currentEvents = []
    
    Log.debug(`${this.name}: Updating status`)
    
    for (const events of this.eventPool.values()) {
      const activeEvents = events.filter(event => {
        return (this.config.calendarSet.length === 0 || 
                this.config.calendarSet.includes(event.calendarName)) &&
               ((event.startDate <= now && event.endDate >= now) ||
                (this.config.includeFullDayEvents && event.fullDayEvent))
      })
      currentEvents = currentEvents.concat(activeEvents)
    }
    
    this.activeEvent = currentEvents.length > 0
    
    if (wasActive !== this.activeEvent) {
      Log.info(`${this.name}: DND Status changed to: ${this.activeEvent ? 'Active' : 'Inactive'}`)
      if (this.activeEvent) {
        Log.debug(`${this.name}: Found ${currentEvents.length} active events`)
      }
      this.updateDom(this.config.animationSpeed)
    }

    if (this.activeEvent) {
      Log.debug(`${this.name}: Rendering DND message: ${this.config.message}`)
      dom.innerHTML = this.config.message
      dom.className = "dnd-active"
    }

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    this.refreshTimer = setTimeout(() => {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
      this.updateDom(this.config.animationSpeed)
    }, this.config.checkInterval)
    
    return dom
  },

  getStyles: function() {
    return ["MMM-DoNotDisturb.css"]
  }
})
