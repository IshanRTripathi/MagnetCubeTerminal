import { toast } from 'react-toastify'
import { logger } from '../utils/logger'
import { isFeatureEnabled } from '../config/featureFlags'

// Queue for managing toast notifications
class ToastQueue {
  constructor() {
    this.queue = []
    this.activeToasts = new Set()
    this.MAX_ACTIVE_TOASTS = 5
    this.subscriptions = new Set()
  }

  add(toastConfig) {
    // Only show toasts if the feature is enabled
    if (!isFeatureEnabled('TOAST_NOTIFICATIONS')) {
      return
    }

    // If we have room for more toasts, show immediately
    if (this.activeToasts.size < this.MAX_ACTIVE_TOASTS) {
      this.showToast(toastConfig)
    } else {
      // Otherwise queue it
      this.queue.push(toastConfig)
    }
  }

  showToast({ level, message, context }) {
    const toastId = `${level}-${Date.now()}`
    this.activeToasts.add(toastId)

    toast[toastTypeMap[level]](
      context ? `${message}\n${JSON.stringify(context, null, 2)}` : message,
      {
        ...toastOptions,
        toastId,
        onClose: () => {
          this.activeToasts.delete(toastId)
          // When a toast closes, show the next one if queued
          if (this.queue.length > 0 && this.activeToasts.size < this.MAX_ACTIVE_TOASTS) {
            this.showToast(this.queue.shift())
          }
        }
      }
    )
  }

  cleanup() {
    // Clear all active toasts
    this.activeToasts.forEach(toastId => {
      toast.dismiss(toastId)
    })
    this.activeToasts.clear()
    this.queue = []

    // Unsubscribe from all log levels
    this.subscriptions.forEach(({ level, callback }) => {
      logger.unsubscribe(level, callback)
    })
    this.subscriptions.clear()
  }
}

// Create a single instance of ToastQueue
const toastQueue = new ToastQueue()

// Configure toast options for different log levels
const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined
}

// Map log levels to toast types
const toastTypeMap = {
  debug: 'info',
  info: 'info',
  warn: 'warning',
  error: 'error'
}

// Initialize notification service
export const initNotifications = () => {
  // Clean up any existing subscriptions first
  toastQueue.cleanup()

  // Only initialize if the feature is enabled
  if (!isFeatureEnabled('TOAST_NOTIFICATIONS')) {
    return () => {}
  }

  // Subscribe to all log levels
  Object.keys(toastTypeMap).forEach(level => {
    const callback = (level, message, context) => {
      // Don't show toasts for debug messages in production
      if (level === 'debug' && process.env.NODE_ENV === 'production') {
        return
      }

      // Add to queue or show immediately if space available
      toastQueue.add({ level, message, context })
    }

    logger.subscribe(level, callback)
    toastQueue.subscriptions.add({ level, callback })
  })

  // Return cleanup function
  return () => {
    toastQueue.cleanup()
  }
}

// Export cleanup function for direct usage
export const cleanupNotifications = () => {
  toastQueue.cleanup()
} 