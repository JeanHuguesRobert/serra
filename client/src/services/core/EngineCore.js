/**
 * Framework-agnostic core engine service using RxJS for state management
 */
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SocketCore } from './SocketCore';

export class EngineCore {
  constructor(config = {}) {
    this.socketCore = new SocketCore(config);
    this.state$ = new BehaviorSubject({ elements: [] });
    this.updates$ = new Subject();
    this.setupSocketListeners();
  }

  async connect() {
    await this.socketCore.connect();
    this.setupSocketListeners();
  }

  disconnect() {
    this.socketCore.disconnect();
  }

  setupSocketListeners() {
    this.socketCore.on('state-update', (state) => {
      this.state$.next(state);
    });

    this.socketCore.on('element-update', (update) => {
      this.updates$.next(update);
    });

    this.socketCore.on('error', (error) => {
      console.error('Engine error:', error);
    });
  }

  getStateObservable() {
    return this.state$.asObservable();
  }

  getUpdatesObservable() {
    return this.updates$.asObservable();
  }

  createElement(id, type) {
    this.socketCore.emit('create-element', { id, type });
    return new Promise((resolve) => {
      this.socketCore.on(`element-created-${id}`, (element) => {
        resolve(element);
      });
    });
  }

  createFormula(id, computations) {
    this.socketCore.emit('create-formula', { id, computations });
    return new Promise((resolve) => {
      this.socketCore.on(`formula-created-${id}`, (formula) => {
        resolve(formula);
      });
    });
  }

  updateElement(id, property, value) {
    this.socketCore.emit('update-element', { id, property, value });
    return new Promise((resolve) => {
      this.socketCore.on(`element-updated-${id}`, (element) => {
        resolve(element);
      });
    });
  }

  deleteElement(id) {
    this.socketCore.emit('delete-element', { id });
    return new Promise((resolve) => {
      this.socketCore.on(`element-deleted-${id}`, () => {
        resolve();
      });
    });
  }

  getElementState(id) {
    return this.state$.pipe(
      map(state => state.elements.find(el => el.id === id))
    );
  }

  getElementUpdates(id) {
    return this.updates$.pipe(
      filter(update => update.id === id)
    );
  }
}