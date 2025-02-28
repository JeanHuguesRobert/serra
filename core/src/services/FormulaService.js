import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Platform-agnostic formula service for managing formula computations
 * Works in both browser and Node.js environments
 */
export class FormulaService extends EventEmitter {
  constructor() {
    super();
    this.formulas = new Map();
    this.computationCache = new Map();
  }

  /**
   * Create a new formula
   * @param {string} id - Formula identifier
   * @param {string} initialValue - Initial formula value
   * @returns {Object} - Formula proxy object
   */
  createFormula(id, initialValue = '') {
    const formula = {
      id,
      value: initialValue,
      dependencies: new Set(),
      computations: new Map()
    };
    
    this.formulas.set(id, formula);
    this.emit('formulaCreated', formula);
    return this.createFormulaProxy(formula);
  }

  /**
   * Create a proxy object for a formula
   * @param {Object} formula - Formula object
   * @returns {Object} - Formula proxy
   * @private
   */
  createFormulaProxy(formula) {
    return {
      getId: () => formula.id,
      getValue: () => formula.value,
      setValue: (value) => {
        formula.value = value;
        this.emit('formulaUpdated', formula);
        this.recomputeDependencies(formula.id);
      },
      addComputation: (computation) => {
        this.addComputation(formula.id, computation);
      },
      removeComputation: (targetId) => {
        this.removeComputation(formula.id, targetId);
      }
    };
  }

  /**
   * Add a computation to a formula
   * @param {string} formulaId - Formula identifier
   * @param {Object} computation - Computation object
   */
  addComputation(formulaId, computation) {
    const formula = this.formulas.get(formulaId);
    if (!formula) return;

    const { inputs, compute, output } = computation;
    formula.computations.set(output, {
      inputs: new Set(inputs),
      compute: typeof compute === 'string' ? eval(compute) : compute
    });

    inputs.forEach(inputId => {
      const inputFormula = this.formulas.get(inputId);
      if (inputFormula) {
        inputFormula.dependencies.add(formulaId);
      }
    });

    this.emit('computationAdded', { formulaId, computation });
    this.recomputeFormula(formulaId);
  }

  /**
   * Remove a computation from a formula
   * @param {string} formulaId - Formula identifier
   * @param {string} targetId - Target formula identifier
   */
  removeComputation(formulaId, targetId) {
    const formula = this.formulas.get(formulaId);
    if (!formula) return;

    formula.computations.delete(targetId);
    this.emit('computationRemoved', { formulaId, targetId });
  }

  /**
   * Recompute a formula
   * @param {string} formulaId - Formula identifier
   */
  recomputeFormula(formulaId) {
    const formula = this.formulas.get(formulaId);
    if (!formula) return;

    formula.computations.forEach((computation, outputId) => {
      const inputValues = Array.from(computation.inputs)
        .map(inputId => this.formulas.get(inputId)?.value)
        .filter(value => value !== undefined);

      if (inputValues.length === computation.inputs.size) {
        try {
          const result = computation.compute(...inputValues);
          const outputFormula = this.formulas.get(outputId);
          if (outputFormula) {
            outputFormula.value = result;
            this.emit('formulaUpdated', outputFormula);
          }
        } catch (error) {
          console.error(`Error computing formula ${formulaId}:`, error);
        }
      }
    });
  }

  /**
   * Recompute dependencies of a formula
   * @param {string} formulaId - Formula identifier
   */
  recomputeDependencies(formulaId) {
    const formula = this.formulas.get(formulaId);
    if (!formula) return;

    formula.dependencies.forEach(dependentId => {
      this.recomputeFormula(dependentId);
    });
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.removeAllListeners();
    this.formulas.clear();
    this.computationCache.clear();
  }
}

// Export a singleton instance
export const formulaService = new FormulaService();
