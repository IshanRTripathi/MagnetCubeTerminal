const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

let currentLogLevel = LOG_LEVELS.INFO
const subscribers = new Map()

for (const level of Object.keys(LOG_LEVELS)) {
  subscribers.set(level, new Set())
}

// Add default console subscriber
const consoleSubscriber = (level, message, context) => {
  const consoleMethod = level.toLowerCase()
  if (context) {
    console[consoleMethod](message, context)
  } else {
    console[consoleMethod](message)
  }
}

// Subscribe console to all levels
Object.keys(LOG_LEVELS).forEach(level => {
  subscribers.get(level).add(consoleSubscriber)
})

export const logger = {
  subscribe(level, callback) {
    const subs = subscribers.get(level)
    if (subs) {
      subs.add(callback)
    }
  },

  unsubscribe(level, callback) {
    const subs = subscribers.get(level)
    if (subs) {
      subs.delete(callback)
    }
  },

  debug(message, context) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      const subs = subscribers.get('DEBUG')
      if (subs) {
        subs.forEach(callback => callback('DEBUG', message, context))
      }
    }
  },

  info(message, context) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      const subs = subscribers.get('INFO')
      if (subs) {
        subs.forEach(callback => callback('INFO', message, context))
      }
    }
  },

  warn(message, context) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      const subs = subscribers.get('WARN')
      if (subs) {
        subs.forEach(callback => callback('WARN', message, context))
      }
    }
  },

  error(message, context) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      const subs = subscribers.get('ERROR')
      if (subs) {
        subs.forEach(callback => callback('ERROR', message, context))
      }
    }
  },

  setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      currentLogLevel = LOG_LEVELS[level]
    }
  }
} 