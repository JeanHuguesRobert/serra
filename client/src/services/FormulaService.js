import { EventEmitter } from 'events';

class FormulaService extends EventEmitter {
  constructor() {
    super();
    this.formulas = new Map();
    this.computationCache = new Map();
  }

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

  removeComputation(formulaId, targetId) {
    const formula = this.formulas.get(formulaId);
    if (!formula) return;

    formula.computations.delete(targetId);
    this.emit('computationRemoved', { formulaId, targetId });
  }

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

  recomputeDependencies(formulaId) {
    const formula = this.formulas.get(formulaId);
    if (!formula) return;

    formula.dependencies.forEach(dependentId => {
      this.recomputeFormula(dependentId);
    });
  }

  cleanup() {
    this.removeAllListeners();
    this.formulas.clear();
    this.computationCache.clear();
  }
}

export default new FormulaService();