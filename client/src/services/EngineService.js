import { io } from 'socket.io-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

class EngineService {
  constructor() {
    this.socket = io('http://localhost:3000');
    this.state$ = new BehaviorSubject({ elements: [] });
    this.updates$ = new Subject();
    
    this.socket.on('state-update', (state) => {
      this.state$.next(state);
    });
    
    this.socket.on('element-update', (update) => {
      this.updates$.next(update);
    });
    
    this.socket.on('error', (error) => {
      console.error('Server error:', error);
    });
  }
  
  getStateObservable() {
    return this.state$.asObservable();
  }
  
  getUpdatesObservable() {
    return this.updates$.asObservable();
  }
  
  createElement(id, type) {
    this.socket.emit('create-element', { id, type });
    return new Promise((resolve) => {
      this.socket.once(`element-created-${id}`, (element) => {
        resolve(element);
      });
    });
  }
  
  createFormula(id, computations) {
    this.socket.emit('create-formula', { id, computations });
    return new Promise((resolve) => {
      this.socket.once(`formula-created-${id}`, (formula) => {
        resolve(formula);
      });
    });
  }
  
  updateElement(id, property, value) {
    this.socket.emit('update-element', { id, property, value });
  }
  
  setDashboard(id) {
    this.socket.emit('set-dashboard', { id });
    return new Promise((resolve) => {
      this.socket.once(`dashboard-set-${id}`, (dashboard) => {
        resolve(dashboard);
      });
    });
  }
  
  createDashboard(id) {
    this.socket.emit('create-dashboard', { id });
    return new Promise((resolve) => {
      this.socket.once(`dashboard-created-${id}`, (dashboard) => {
        resolve(dashboard);
      });
    });
  }
  
  observe(id, property) {
    return this.updates$.asObservable().pipe(
      filter(update => update.id === id && update.property === property),
      map(update => update.value)
    );
  }
  
  start() {
    this.socket.emit('start-engine');
  }
  
  stop() {
    this.socket.emit('stop-engine');
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.state$.complete();
    this.updates$.complete();
  }
}

export default new EngineService();
