import { BehaviorSubject } from 'rxjs';

export class Model {
  constructor() {
    this.state$ = new BehaviorSubject({});
  }

  update(path, value) {
    const currentState = this.state$.value;
    const newState = {
      ...currentState,
      [path]: value
    };
    this.state$.next(newState);
  }
}