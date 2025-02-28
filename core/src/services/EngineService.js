import { EventEmitter } from '../utils/EventEmitter.js';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Platform-agnostic engine service for managing engine state and operations
 * Works in both browser and Node.js environments
 */
export class EngineService extends EventEmitter {
  constructor() {
    super();
    this.state$ = new BehaviorSubject({ elements: [] });
    this.updates$ = new Subject();
  }

  /**
   * Connect to the engine
   * @param {Object} options - Connection options
   * @returns {Promise} - Resolves when connected
   */
  connect(options = {}) {
    throw new Error('connect method must be implemented by concrete classes');
  }

  /**
   * Disconnect from the engine
   */
  disconnect() {
    throw new Error('disconnect method must be implemented by concrete classes');
  }

  /**
   * Get the state observable
   * @returns {Observable} - State observable
   */
  getStateObservable() {
    return this.state$.asObservable();
  }
  
  /**
   * Get the updates observable
   * @returns {Observable} - Updates observable
   */
  getUpdatesObservable() {
    return this.updates$.asObservable();
  }
  
  /**
   * Create an element
   * @param {string} id - Element identifier
   * @param {string} type - Element type
   * @returns {Promise<Object>} - Created element
   */
  createElement(id, type) {
    throw new Error('createElement method must be implemented by concrete classes');
  }
  
  /**
   * Create a formula
   * @param {string} id - Formula identifier
   * @param {Object} computations - Formula computations
   * @returns {Promise<Object>} - Created formula
   */
  createFormula(id, computations) {
    throw new Error('createFormula method must be implemented by concrete classes');
  }
  
  /**
   * Update an element
   * @param {string} id - Element identifier
   * @param {string} property - Property to update
   * @param {any} value - New value
   */
  updateElement(id, property, value) {
    throw new Error('updateElement method must be implemented by concrete classes');
  }
  
  /**
   * Set the current dashboard
   * @param {string} id - Dashboard identifier
   * @returns {Promise<Object>} - Dashboard object
   */
  setDashboard(id) {
    throw new Error('setDashboard method must be implemented by concrete classes');
  }
  
  /**
   * Create a dashboard
   * @param {string} id - Dashboard identifier
   * @returns {Promise<Object>} - Created dashboard
   */
  createDashboard(id) {
    throw new Error('createDashboard method must be implemented by concrete classes');
  }
  
  /**
   * Observe changes to an element property
   * @param {string} id - Element identifier
   * @param {string} property - Property to observe
   * @returns {Observable} - Property observable
   */
  observe(id, property) {
    return this.updates$.asObservable().pipe(
      filter(update => update.id === id && update.property === property),
      map(update => update.value)
    );
  }
  
  /**
   * Start the engine
   */
  start() {
    throw new Error('start method must be implemented by concrete classes');
  }
  
  /**
   * Stop the engine
   */
  stop() {
    throw new Error('stop method must be implemented by concrete classes');
  }
}

// Export a singleton instance
export const engineService = new EngineService();
