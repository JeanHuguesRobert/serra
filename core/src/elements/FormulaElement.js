import { Element } from '../Element.js';
import { Subject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export class FormulaElement extends Element {
  constructor(id) {
    super(id, 'formula');
    this.computations = new Map();
    this.activeComputation = null;
  }

  setComputations({ forward, solveForA, solveForB, solveForX, solveForC }) {
    // Clear any existing computations
    this.computations.clear();
    
    // Set up forward computation first
    this.setComputation('forward', forward, true);
    
    // Set up backward computations
    if (solveForA) this.setComputation('solveForA', solveForA);
    if (solveForB) this.setComputation('solveForB', solveForB);
    if (solveForX) this.setComputation('solveForX', solveForX);
    if (solveForC) this.setComputation('solveForC', solveForC);
  }

  setComputation(name, { inputs, output, compute }, isForward = false) {
    console.log(`\n[${name}] Setting up computation:`, { inputs, output, compute });
    
    // Extract function body while preserving input parameter names
    let functionBody;
    if (compute.includes('=>')) {
      const arrowMatch = compute.match(/\((.*?)\)\s*=>\s*(.*)/);
      functionBody = arrowMatch[2].trim();
    } else {
      // For simple expressions, use input names directly
      functionBody = inputs.reduce((expr, param) => {
        const regex = new RegExp(`\\b${param.toLowerCase()}\\b`, 'g');
        return expr.replace(regex, param);
      }, compute);
    }
    console.log(`[${name}] Function body:`, functionBody);
    
    const fn = new Function(...inputs, `return ${functionBody}`);
    this.computations.set(name, { inputs, output, fn });

    const inputElements = inputs.map(id => {
      const el = this.engine.getElementById(id);
      console.log(`[${name}] Input ${id}:`, el?.id);
      // Initialize with 0 if no value
      if (el && el.getValue() === undefined) {
        el.setValue(0);
      }
      return el;
    });
    const outputElement = this.engine.getElementById(output);
    console.log(`[${name}] Output ${output}:`, outputElement?.id);

    const subscription = combineLatest(inputElements.map(el => {
      console.log(`[${name}] Setting up stream for ${el.id}`);
      return el.value$;
    }))
      .pipe(
        map(values => {
          console.log(`[${name}] Computing with values:`, values);
          try {
            const result = Number(fn.apply(null, values));
            console.log(`[${name}] Computed result:`, result);
            return isNaN(result) ? undefined : result;
          } catch (e) {
            console.error(`[${name}] Computation error:`, e);
            return undefined;
          }
        }),
        distinctUntilChanged()
      )
      .subscribe(value => {
        console.log(`[${name}] New value to set:`, value);
        if (!this.activeComputation && value !== undefined) {
          this.activeComputation = name;
          outputElement.setValue(value);
          console.log(`[${name}] Set ${output} to:`, value);
          this.activeComputation = null;
        }
      });

    return subscription;
  }
  setValue(value) {
    const currentValue = this.getValue();
    if (!this.activeComputation && currentValue !== value) {
      this.activeComputation = 'backward';
      console.log(`[${this.id}] Setting value to:`, value);
      
      // Get all possible input elements
      const inputA = this.engine.getElementById('A');
      const inputB = this.engine.getElementById('B');
      const inputX = this.engine.getElementById('X');
      const inputC = this.engine.getElementById('C');
      
      // Try backward computations based on available inputs
      const solveForB = this.computations.get('solveForB');
      const solveForA = this.computations.get('solveForA');
      const solveForX = this.computations.get('solveForX');
      const solveForC = this.computations.get('solveForC');
      
      if (this.id === 'Y' && solveForC && inputX) {
        const xValue = inputX.getValue();
        if (xValue !== undefined) {
          const result = solveForC.fn(value, xValue);
          if (!isNaN(result)) {
            console.log(`[${this.id}] Backward compute C:`, result);
            this.engine.getElementById('C').setValue(result);
          }
        }
      } else if (solveForB && inputA) {
        const result = solveForB.fn(value, aValue);
        if (!isNaN(result)) {
          console.log(`[${this.id}] Backward compute B:`, result);
          this.engine.getElementById('B').setValue(result);
        }
      } else if (solveForA && inputB && bValue !== undefined) {
        const result = solveForA.fn(value, bValue);
        if (!isNaN(result)) {
          console.log(`[${this.id}] Backward compute A:`, result);
          this.engine.getElementById('A').setValue(result);
        }
      }
      this.activeComputation = null;
    }
    super.setValue(value);
  }
}