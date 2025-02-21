import { BehaviorSubject, Subject } from 'rxjs';

export class Engine {
  constructor() {
    this.model$ = new BehaviorSubject({});
    this.commands$ = new Subject();
  }

  // Command handling
  dispatch(command) {
    this.commands$.next(command);
  }

  // State updates
  getState() {
    return this.model$.value;
  }

  // Observe specific paths in the model
  observe(path) {
    return this.model$.pipe(
      map(state => path.split('.').reduce((obj, key) => obj?.[key], state))
    );
  }
}