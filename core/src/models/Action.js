export class Action {
  constructor(type, payload = {}) {
    this.type = type;
    this.payload = payload;
    this.timestamp = Date.now();
  }

  static create(type, payload) {
    return new Action(type, payload);
  }
}