/**
 * @typedef {Object} FeatureFlags
 * @property {boolean} TOAST_NOTIFICATIONS - Enable toast notifications for console logs
 * @property {boolean} PARTICLE_EFFECTS - Enable particle effects for highlights and players
 */

/**
 * Feature flags configuration
 * @type {FeatureFlags}
 */
export const FEATURE_FLAGS = {
  TOAST_NOTIFICATIONS: false, // Set to false to disable toast notifications
  PARTICLE_EFFECTS: true // Set to false to disable particle effects
}

/**
 * Get the value of a feature flag
 * @param {keyof FeatureFlags} flag - The feature flag to check
 * @returns {boolean} - The value of the feature flag
 */
export const isFeatureEnabled = (flag) => {
  if (!(flag in FEATURE_FLAGS)) {
    console.warn(`Feature flag "${flag}" does not exist`)
    return false
  }
  return FEATURE_FLAGS[flag]
}

/**
 * Hook to check if a feature is enabled
 * @param {keyof FeatureFlags} flag - The feature flag to check
 * @returns {boolean} - Whether the feature is enabled
 */
export const useFeature = (flag) => {
  return isFeatureEnabled(flag)
} 