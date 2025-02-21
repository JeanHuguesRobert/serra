export class ElementModel {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.properties = {};
    this.children = [];
  }

  setProperty(key, value) {
    this.properties[key] = value;
  }

  getProperty(key) {
    return this.properties[key];
  }

  addChild(child) {
    this.children.push(child);
  }

  removeChild(childId) {
    this.children = this.children.filter(child => child.id !== childId);
  }
}