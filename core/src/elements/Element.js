import { EventEmitter } from 'events';

/**
 * Base Element class that all Serra elements must extend.
 * Implements core functionality for state management and event handling.
 * 
 * Architecture notes:
 * - Elements are stateful entities managed by the Engine
 * - Each element has a unique ID and type
 * - Elements can emit events for value changes
 * - Properties are managed through a Map for flexibility
 * - Elements support serialization via toJSON
 * 
 * @emits 'value' - When element value changes
 * @emits 'property' - When any property changes
 */
export class Element extends EventEmitter {
  constructor(id, type) {
    super();
    if (!id) throw new Error('Element requires an ID');
    if (!type) throw new Error('Element requires a type');

    this.id = id;
    this._type = type;
    
    // Core state
    this._value = null;
    this._properties = new Map();
    
    // Computation support
    this.computations = new Map();
    this.subscriptions = [];
  }

  /**
   * Gets element type. Required for all elements.
   * Used by Engine for type checking and routing.
   */
  getType() {
    return this._type;
  }

  /**
   * Core value getter used by Engine computations
   */
  getValue() {
    return this._value;
  }

  /**
   * Sets element value and emits change event
   * Engine listens for these events to trigger computations
   */
  setValue(value) {
    const oldValue = this._value;
    this._value = value;
    
    if (oldValue !== value) {
      this.emit('value', value);
    }
  }

  /**
   * Generic property accessor
   * Allows elements to have custom properties beyond value
   */
  getProperty(key) {
    return this._properties.get(key);
  }

  /**
   * Updates property and emits change event
   */
  setProperty(key, value) {
    this._properties.set(key, value);
    this.emit('property', { key, value });
  }

  /**
   * Lifecycle method called by Engine.start()
   */
  start() {
    this.emit('start');
  }

  /**
   * Cleanup method called by Engine.stop()
   */
  stop() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.emit('stop');
  }

  /**
   * Serialization support for state sync
   */
  toJSON() {
    return {
      id: this.id,
      type: this.getType(),
      value: this.getValue(),
      properties: Object.fromEntries(this._properties)
    };
  }
}
