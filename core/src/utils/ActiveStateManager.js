/**
 * ActiveStateManager - Core state management implementation
 * Handles state transitions, validation, and error handling
 */

class ActiveStateManager {
  constructor(initialState = null) {
    this.currentState = initialState;
    this.desiredState = null;
    this.transitioningState = null;
    this.errorState = null;
    this.stateHistory = [];
    this.subscribers = new Set();
    this.stateChangeHooks = new Map();
  }

  /**
   * Get the current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Set the desired state and initiate transition if valid
   */
  setDesiredState(newState) {
    if (!this.validateStateTransition(newState)) {
      this.setErrorState(new Error('Invalid state transition'));
      return false;
    }

    const beforeTransitionResult = this.executeHooks('beforeTransition', { from: this.currentState, to: newState });
    if (beforeTransitionResult === false) {
      this.setErrorState(new Error('State transition cancelled by hook'));
      return false;
    }

    this.desiredState = newState;
    this.transitioningState = true;
    this.executeHooks('onTransitionStart', { from: this.currentState, to: newState });
    this.notifySubscribers();
    return true;
  }

  /**
   * Complete the state transition
   */
  completeTransition() {
    if (!this.transitioningState) {
      return false;
    }

    const prevState = this.currentState;
    this.addToHistory(this.currentState);
    this.currentState = this.desiredState;
    this.desiredState = null;
    this.transitioningState = false;

    this.executeHooks('afterTransition', { from: prevState, to: this.currentState });
    this.notifySubscribers();
    return true;
  }

  /**
   * Register a state change hook
   * @param {string} hookType - Type of hook (beforeTransition, onTransitionStart, afterTransition, onStateUpdate, onError)
   * @param {Function} callback - Hook callback function
   * @returns {Function} Unregister function
   */
  registerHook(hookType, callback) {
    if (!this.stateChangeHooks.has(hookType)) {
      this.stateChangeHooks.set(hookType, new Set());
    }
    this.stateChangeHooks.get(hookType).add(callback);
    return () => this.stateChangeHooks.get(hookType).delete(callback);
  }

  /**
   * Execute hooks of a specific type
   * @param {string} hookType - Type of hook to execute
   * @param {Object} context - Hook execution context
   * @returns {boolean} Whether all hooks executed successfully
   */
  executeHooks(hookType, context) {
    if (!this.stateChangeHooks.has(hookType)) return true;

    try {
      const hooks = Array.from(this.stateChangeHooks.get(hookType));
      const results = hooks.map(hook => {
        try {
          return hook(context);
        } catch (error) {
          console.error(`Error executing ${hookType} hook:`, error);
          return true; // Continue execution unless explicitly returned false
        }
      });
      return !results.includes(false);
    } catch (error) {
      this.setErrorState(error);
      return false;
    }
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Subscriber callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    // Immediately notify the new subscriber of the current state
    callback(this.getStateUpdate());
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of state changes
   */
  notifySubscribers() {
    const update = this.getStateUpdate();
    this.executeHooks('onStateUpdate', update);
    this.subscribers.forEach(callback => callback(update));
  }

  /**
   * Get the current state update object
   * @returns {Object} Current state update
   */
  getStateUpdate() {
    return {
      current: this.currentState,
      desired: this.desiredState,
      transitioning: this.transitioningState,
      error: this.errorState,
      history: [...this.stateHistory]
    };
  }

  /**
   * Add state to history
   * @param {*} state - State to add to history
   */
  addToHistory(state) {
    this.stateHistory.push({
      state,
      timestamp: Date.now(),
      transitionId: Math.random().toString(36).substr(2, 9)
    });
  }

  /**
   * Set error state
   * @param {Error} error - Error object
   */
  setErrorState(error) {
    this.errorState = error;
    this.executeHooks('onError', { error });
    this.notifySubscribers();
  }

  /**
   * Clear error state
   */
  clearErrorState() {
    this.errorState = null;
    this.notifySubscribers();
  }

  /**
   * Validate state transition
   * @param {*} newState - Desired new state
   * @returns {boolean} Whether the transition is valid
   */
  validateStateTransition(newState) {
    if (this.transitioningState) {
      return false;
    }
    return true;
  }
}

export default ActiveStateManager;