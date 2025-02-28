import { io } from 'socket.io-client';
import { EngineService } from '@serra/core';

class BrowserEngineService extends EngineService {
  constructor() {
    super();
    this.socket = null;
  }
  
  connect(url = 'http://localhost:3000') {
    this.socket = io(url);
    
    this.socket.on('state-update', (state) => {
      this.state$.next(state);
    });
    
    this.socket.on('element-update', (update) => {
      this.updates$.next(update);
    });
    
    this.socket.on('error', (error) => {
      console.error('Server error:', error);
      this.emit('error', error);
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.state$.complete();
    this.updates$.complete();
  }
  
  createElement(id, type) {
    if (!this.socket) {
      throw new Error('Not connected to engine');
    }
    
    this.socket.emit('create-element', { id, type });
    return new Promise((resolve) => {
      this.socket.once(`element-created-${id}`, (element) => {
        resolve(element);
      });
    });
  }
  
  createFormula(id, computations) {
    if (!this.socket) {
      throw new Error('Not connected to engine');
    }
    
    this.socket.emit('create-formula', { id, computations });
    return new Promise((resolve) => {
      this.socket.once(`formula-created-${id}`, (formula) => {
        resolve(formula);
      });
    });
  }
  
  updateElement(id, property, value) {
    if (!this.socket) {
      throw new Error('Not connected to engine');
    }
    
    this.socket.emit('update-element', { id, property, value });
  }
  
  setDashboard(id) {
    if (!this.socket) {
      throw new Error('Not connected to engine');
    }
    
    this.socket.emit('set-dashboard', { id });
    return new Promise((resolve) => {
      this.socket.once(`dashboard-set-${id}`, (dashboard) => {
        resolve(dashboard);
      });
    });
  }
  
  createDashboard(id) {
    if (!this.socket) {
      throw new Error('Not connected to engine');
    }
    
    this.socket.emit('create-dashboard', { id });
    return new Promise((resolve) => {
      this.socket.once(`dashboard-created-${id}`, (dashboard) => {
        resolve(dashboard);
      });
    });
  }
  
  start() {
    if (!this.socket) {
      throw new Error('Not connected to engine');
    }
    
    this.socket.emit('start-engine');
  }
  
  stop() {
    if (!this.socket) {
      throw new Error('Not connected to engine');
    }
    
    this.socket.emit('stop-engine');
  }
}

export default new BrowserEngineService();
