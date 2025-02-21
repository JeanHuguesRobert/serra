import { Subject } from 'rxjs';

export class Element {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.properties = new Map();
    this.value$ = new Subject();
    this.properties$ = new Subject();
    this.engine = null;
  }

  setEngine(engine) {
    this.engine = engine;
  }

  setValue(value) {
    this.value$.next(value);
  }

  getValue() {
    let value;
    this.value$.subscribe(v => value = v).unsubscribe();
    return value;
  }

  setProperty(key, value) {
    this.properties.set(key, value);
    this.properties$.next({ key, value });
  }

  getProperty(key) {
    return this.properties.get(key);
  }
}