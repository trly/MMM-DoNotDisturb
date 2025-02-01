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
    Log.debug('Loaded config:', this.config)
    this.eventPool = new Map()
    this.activeEvent = null
    this.updateDom()
  },

  notificationReceived: function(notification, payload, sender) {
    if (notification === this.config.eventNotification) {
      Log.debug(`${this.name}: Received ${payload.length} calendar events from ${sender.identifier}:`, payload)
      
      const monitoredEvents = payload.map(event => {
        if (this.config.calendarSet.length === 0 || 
            this.config.calendarSet.includes(event.calendarName)) {
          return event
        }
        return null
      }).filter(event => event !== null)

      Log.debug(`${this.name}: Adding ${monitoredEvents.length } events to the eventPool`, monitoredEvents)
      this.eventPool.set(sender.identifier, JSON.parse(JSON.stringify(monitoredEvents)))
    }
  },

  getDom: function() {
    const dom = document.createElement("div")
    const wasActive = this.activeEvent
    const now = Date.now()
    let currentEvents = []
    
    Log.debug(`${this.name}: Updating DND status`)
    
    for (const events of this.eventPool.values()) {
      const activeEvents = events.filter(event => {
        return (this.config.calendarSet.length === 0 || 
                this.config.calendarSet.includes(event.calendarName)) && 
               ((!event.fullDayEvent && event.startDate <= now && event.endDate >= now) ||
                (event.fullDayEvent && this.config.includeFullDayEvents))
      })
      currentEvents = currentEvents.concat(activeEvents)
      Log.debug(`${this.name}: Found ${activeEvents.length} active events`)
      for (const event of activeEvents) {
        Log.debug(`${this.name}: Found active event: ${event.title}, ${event.startDate}, ${event.endDate}`)
      }
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
