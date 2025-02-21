export class State {
  constructor() {
    this.elements = [];
    this.lastUpdated = null;
    this.lastAction = null;
  }

  update(elements, action) {
    this.elements = elements;
    this.lastUpdated = Date.now();
    this.lastAction = action;
  }
}