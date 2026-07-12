import { ActiveState } from '../../core/src/utils/ActiveState.js';
import { firstValueFrom } from 'rxjs';

describe('ActiveState', () => {
  describe('Boolean State Operations', () => {
    let state;

    beforeEach(() => {
      state = new ActiveState(false);
    });

    test('initializes with correct state', () => {
      expect(state.current()).toBe(false);
      expect(state.desired()).toBe(false);
      expect(state.stable()).toBe(true);
    });

    test('toggles state correctly', () => {
      state.toggle();
      expect(state.desired()).toBe(true);
      expect(state.current()).toBe(false);
      expect(state.stable()).toBe(false);

      state.set(true);
      expect(state.current()).toBe(true);
      expect(state.stable()).toBe(true);
    });

    test('handles expect updates', () => {
      state.expect(true);
      expect(state.desired()).toBe(true);
      expect(state.current()).toBe(false);
      
      state.expect(false);
      expect(state.desired()).toBe(false);
      expect(state.current()).toBe(false);
    });

    test('notifies subscribers of changes', () => {
      const mockCallback = jest.fn();
      state.subscribe(mockCallback);

      state.set(true);
      expect(mockCallback).toHaveBeenCalledWith(true, false, false, false);

      state.expect(true);
      expect(mockCallback).toHaveBeenCalledWith(true, true, true, false);
    });

    test('handles unsubscribe correctly', () => {
      const mockCallback = jest.fn();
      const unsubscribe = state.subscribe(mockCallback);

      unsubscribe();
      state.set(true);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('RxJS Integration', () => {
    let state;

    beforeEach(() => {
      state = new ActiveState(false);
    });

    test('creates observable and emits values', async () => {
      const values = [];
      state.toObservable().subscribe(value => values.push(value));

      state.set(true);
      state.set(false);
      state.set(true);

      expect(values).toEqual([false, true, false, true]);
    });

    test('handles async operations with firstValueFrom', async () => {
      const promise = firstValueFrom(state.toObservable());
      const value = await promise;
      expect(value).toBe(false);
    });

    test('completes observable on unsubscribe', (done) => {      const mockComplete = jest.fn();
      const observable = state.toObservable();
      const subscription = observable.subscribe({
        next: (v) => {},
        complete: () => {
          mockComplete();
          expect(mockComplete).toHaveBeenCalled();
          done();
        },
        error: ( e ) => { console.log( "ERROR", e)}
      });

      subscription.complete();
      subscription.unsubscribe();
    });
  });
});