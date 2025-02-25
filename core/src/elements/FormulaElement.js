import { Element } from './Element.js';
import { Subject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, debounceTime, filter } from 'rxjs/operators';

export class FormulaElement extends Element {
  constructor(id) {
    super(id, 'formula');
    this.computations = new Map();
    this.subscriptions = [];
  }
  
  getValue() {
    return super.getValue();
  }
  
  setValue(value) {
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      return;
    }
    super.setValue(numericValue);
    this.value$.next(numericValue);
  }
  
  setValueWithoutTrigger(value) {
    super.setProperty('value',value);
  }
  
  addComputations(computations) {
    // Set up all computations first
    Object.entries(computations).forEach(([name, config]) => {
      this.ensureElements(config);
      const effectiveOutput = config.output || name;
      this.setupComputation(name, { ...config, output: effectiveOutput });
    });
    // Initialize all input values to trigger the computation chain
    Object.entries(computations).forEach(([_, config]) => {
      config.inputs.forEach(inputId => {
        const inputElement = this.engine.getElement(inputId);
        if (inputElement) {
          const currentValue = inputElement.getValue();
          if (currentValue !== undefined) {
            inputElement.setValue(currentValue);
          } else {
            inputElement.setValue(0);
          }
        }
      });
    });
  }
  
  ensureElements(config) {
    if (!config.inputs || !Array.isArray(config.inputs)) {
      throw new Error('Invalid computation configuration: inputs must be an array');
    }
  
    config.inputs.forEach(id => {
      const element = this.engine.getElement(id);
      if (!element) {
        throw new Error(`Input element ${id} not found`);
      }
    });
  
    if (config.output && config.output !== this.id) {
      const outputElement = this.engine.getElement(config.output);
      if (!outputElement) {
        throw new Error(`Output element ${config.output} not found`);
      }
    }
  }
  
  setupComputation(name, { inputs, compute, output }) {
    const computeFunction = this.createComputeFunction(compute, inputs);
    const targetId = output || name;

    const inputStreams = inputs.map(id => {
      const element = this.engine.getElement(id);
      if (!element || !element.value$) {
        throw new Error(`Input element ${id} not found or not properly initialized`);
      }
      return element.value$.pipe(
        map(value => Number(value)),
        filter(value => !isNaN(value)),
        distinctUntilChanged()
      );
    });
    
    const subscription = combineLatest(inputStreams).pipe(
      map(values => {
        try {
          const result = Number(computeFunction.apply(null, values));
          return isNaN(result) ? null : result;
        } catch (error) {
          console.error('Error in computation:', error);
          return null;
        }
      }),
      filter(result => result !== null),
      distinctUntilChanged()
    ).subscribe(result => {
      const targetElement = this.engine.getElement(targetId);
      if (targetElement) {
        targetElement.setValueWithoutTrigger(result);
        targetElement.value$.next(result);
      }
    });
    this.subscriptions.push(subscription);
  }
  disconnect() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    // Clear all computations
    this.computations.clear();
  }
  dispose() {
    this.disconnect();
    super.dispose();
  }
  createComputeFunction(compute, inputs) {
    if (typeof compute === 'string') {
      if (compute.startsWith('(') && compute.includes('=>')) {
        try {
          const fn = eval(compute);
          if (typeof fn === 'function') {
            return fn;
          }
        } catch (error) {
          console.error('Error evaluating arrow function:', error);
          return () => 0;
        }
      }
      try {
        // For simple expressions, wrap them in a return statement
        const body = compute.includes('return') ? compute : `return ${compute}`;
        const fn = new Function(...inputs, body);
        return fn;
      } catch (error) {
        console.error('Error creating function:', error);
        return () => 0;
      }
    }
    return compute;
  }

}