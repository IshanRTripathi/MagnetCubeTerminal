/**
 * Base Singleton class to handle instance management
 * @template T
 */
export class Singleton {
  static #instances = new Map()
  static #locks = new Map()

  /**
   * Get the singleton instance of a class
   * @template T
   * @param {new () => T} ClassConstructor - The class constructor
   * @returns {T} The singleton instance
   */
  static getInstance(ClassConstructor) {
    // Check if we're already creating an instance (lock check)
    if (this.#locks.get(ClassConstructor.name)) {
      throw new Error(`Recursive getInstance() call for ${ClassConstructor.name}`)
    }

    // Set lock while we create the instance
    this.#locks.set(ClassConstructor.name, true)

    try {
      // Get or create instance
      let instance = this.#instances.get(ClassConstructor.name)
      if (!instance) {
        instance = new ClassConstructor()
        this.#instances.set(ClassConstructor.name, instance)
      }
      return instance
    } finally {
      // Always remove the lock
      this.#locks.delete(ClassConstructor.name)
    }
  }

  /**
   * Clear all instances (useful for testing)
   */
  static clearInstances() {
    this.#instances.clear()
    this.#locks.clear()
  }
} 