/**
 * State Subscription System
 * Provides a centralized subscription mechanism for state changes
 */

class StateSubscriptionSystem {
  constructor() {
    this.subscribers = new Map();
    this.subscriptionId = 0;
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Function to call when state changes
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback, options = {}) {
    const id = this.generateSubscriptionId();
    this.subscribers.set(id, {
      callback,
      options,
      timestamp: Date.now()
    });

    return () => this.unsubscribe(id);
  }

  /**
   * Unsubscribe from state changes
   * @param {string} id - Subscription ID
   */
  unsubscribe(id) {
    this.subscribers.delete(id);
  }

  /**
   * Notify all subscribers of state change
   * @param {Object} stateUpdate - Current state update
   */
  notifySubscribers(stateUpdate) {
    this.subscribers.forEach(({ callback, options }) => {
      try {
        if (this.shouldNotifySubscriber(stateUpdate, options)) {
          callback(stateUpdate);
        }
      } catch (error) {
        console.error('Error in state subscription callback:', error);
      }
    });
  }

  /**
   * Check if subscriber should be notified based on options
   * @param {Object} stateUpdate - Current state update
   * @param {Object} options - Subscriber options
   * @returns {boolean}
   */
  shouldNotifySubscriber(stateUpdate, options) {
    if (options.filter) {
      return options.filter(stateUpdate);
    }

    if (options.stateTypes) {
      const updateTypes = Object.keys(stateUpdate).filter(key => stateUpdate[key] !== null);
      return options.stateTypes.some(type => updateTypes.includes(type));
    }

    return true;
  }

  /**
   * Generate unique subscription ID
   * @returns {string}
   */
  generateSubscriptionId() {
    return `sub_${++this.subscriptionId}_${Date.now()}`;
  }

  /**
   * Clear all subscriptions
   */
  clearAllSubscriptions() {
    this.subscribers.clear();
  }
}

export default StateSubscriptionSystem;