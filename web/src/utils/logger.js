// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

// Current log level (can be adjusted based on environment)
let currentLogLevel = LOG_LEVELS.DEBUG

// Format message with timestamp and context
const formatMessage = (level, message, context = null) => {
  const timestamp = new Date().toISOString()
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  if (context) {
    formattedMessage += ` ${JSON.stringify(context)}`
  }
  return formattedMessage
}

// Event emitter for log subscriptions
const subscribers = {
  debug: new Set(),
  info: new Set(),
  warn: new Set(),
  error: new Set()
}

// Logger object with subscription support
const logger = {
  // Subscribe to log events
  subscribe: (level, callback) => {
    if (subscribers[level]) {
      subscribers[level].add(callback)
    }
  },

  // Unsubscribe from log events
  unsubscribe: (level, callback) => {
    if (subscribers[level]) {
      subscribers[level].delete(callback)
    }
  },

  // Log methods
  debug: (message, context = null) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      const formattedMessage = formatMessage('debug', message, context)
      console.debug(formattedMessage)
      subscribers.debug.forEach(callback => callback('debug', message, context))
    }
  },

  info: (message, context = null) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      const formattedMessage = formatMessage('info', message, context)
      console.info(formattedMessage)
      subscribers.info.forEach(callback => callback('info', message, context))
    }
  },

  warn: (message, context = null) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      const formattedMessage = formatMessage('warn', message, context)
      console.warn(formattedMessage)
      subscribers.warn.forEach(callback => callback('warn', message, context))
    }
  },

  error: (message, context = null) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      const formattedMessage = formatMessage('error', message, context)
      console.error(formattedMessage)
      subscribers.error.forEach(callback => callback('error', message, context))
    }
  },

  // Set log level
  setLevel: (level) => {
    if (LOG_LEVELS[level.toUpperCase()] !== undefined) {
      currentLogLevel = LOG_LEVELS[level.toUpperCase()]
    }
  }
}

export { logger, LOG_LEVELS } 