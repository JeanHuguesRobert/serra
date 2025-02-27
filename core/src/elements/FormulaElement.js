import { Element } from './Element.js';
import { ElementTypes } from '../types/ElementTypes.js';

/**
 * FormulaElement represents a computational node in the engine.
 * It can:
 * - Take multiple input elements
 * - Apply JavaScript expressions to compute results
 * - Update automatically when inputs change
 * - Support async computations
 * - Chain with other formulas
 * 
 * Design:
 * - Extends base Element for engine compatibility
 * - Uses computation map for dependency tracking
 * - Supports dynamic expression evaluation
 * - Auto-updates on input changes
 */
export class FormulaElement extends Element {
  constructor(id) {
    super(id, ElementTypes.FORMULA);
    
    // Formula specific properties
    this._expression = '';           // JavaScript expression
    this._inputs = new Set();        // Input element IDs
    this._lastComputed = null;       // Last computation timestamp
    this._error = null;              // Last computation error
  }

  /**
   * Sets the computation expression and input dependencies
   * @param {string} expression - JavaScript expression to evaluate
   * @param {string[]} inputs - Array of input element IDs
   */
  setFormula(expression, inputs = []) {
    this._expression = expression;
    this._inputs.clear();
    inputs.forEach(id => this._inputs.add(id));
    
    // Register this formula with input elements
    inputs.forEach(inputId => {
      const inputElement = this.engine?.getElement(inputId);
      if (inputElement) {
        inputElement.computations.set(this.id, {
          inputs: Array.from(this._inputs),
          compute: this._expression
        });
      }
    });

    this.compute(); // Initial computation
  }

  /**
   * Allows spreadsheet-style formula syntax
   * @example
   * formula.setSpreadsheetFormula('=SUM(temp1:temp5)');
   * formula.setSpreadsheetFormula('=AVERAGE(sensors.*) * 1.5');
   */
  setSpreadsheetFormula(formula) {
    if (!formula.startsWith('=')) {
      throw new Error('Spreadsheet formulas must start with =');
    }

    // Convert spreadsheet syntax to JavaScript
    const jsFormula = this.convertToJavaScript(formula);
    const inputs = this.extractReferences(formula);
    
    this.setFormula(jsFormula, inputs);
  }

  /**
   * Convert spreadsheet notation to JavaScript
   * @private
   */
  convertToJavaScript(formula) {
    return formula
      .replace(/^=/, '')                           // Remove leading =
      .replace(/SUM\((.*?)\)/g, 'sum($1)')        // Convert SUM to sum()
      .replace(/AVERAGE\((.*?)\)/g, 'avg($1)')    // Convert AVERAGE to avg()
      .replace(/(\w+:\w+)/g, 'range("$1")');       // Convert A1:A10 to range()
      // ...more conversions...
  }

  /**
   * Executes the formula expression with current input values
   * @returns {Promise<any>} Computed result
   */
  async compute() {
    if (!this._expression) return null;

    try {
      // Get current input values
      const inputs = Array.from(this._inputs).map(id => {
        const el = this.engine?.getElement(id);
        return { id, value: el?.getValue() };
      });

      // Create computation context
      const context = Object.fromEntries(
        inputs.map(({ id, value }) => [id, value])
      );

      // Create and execute formula function
      const fn = new Function(...Object.keys(context), `return ${this._expression}`);
      const result = await fn(...Object.values(context));

      this._lastComputed = Date.now();
      this._error = null;
      this.setValue(result);
      return result;

    } catch (error) {
      this._error = error.message;
      this.emit('error', error);
      return null;
    }
  }

  /**
   * Get formula metadata
   */
  getFormula() {
    return {
      expression: this._expression,
      inputs: Array.from(this._inputs),
      lastComputed: this._lastComputed,
      error: this._error
    };
  }

  /**
   * Validates formula syntax without execution
   */
  validate() {
    try {
      new Function('return ' + this._expression);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      formula: this.getFormula()
    };
  }
}