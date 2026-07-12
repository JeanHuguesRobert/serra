import { useEffect, useState } from 'react';
import ActiveStateManager from '../../../core/src/utils/ActiveStateManager';

/**
 * Custom hook for integrating ActiveStateManager into React components
 * @param {*} initialState - Initial state value
 * @param {Object} options - Hook configuration options
 * @returns {Object} State management methods and current state
 */
const useActiveState = ({
  initialState = null,
  onStateChange,
  onError,
  validateTransition,
  beforeTransition,
  onTransitionStart,
  afterTransition,
  onStateUpdate
} = {}) => {
  const [stateManager] = useState(() => new ActiveStateManager(initialState));
  const [stateUpdate, setStateUpdate] = useState({
    current: initialState,
    desired: null,
    transitioning: false,
    error: null,
    history: []
  });

  useEffect(() => {
    const handleStateUpdate = (update) => {
      setStateUpdate(update);
      onStateChange?.(update);
      onStateUpdate?.(update);
      if (update.error) {
        onError?.(update.error);
      }
    };

    // Register state transition hooks
    const unregisterHooks = [
      beforeTransition && stateManager.registerHook('beforeTransition', beforeTransition),
      onTransitionStart && stateManager.registerHook('onTransitionStart', onTransitionStart),
      afterTransition && stateManager.registerHook('afterTransition', afterTransition)
    ].filter(Boolean);

    const unsubscribe = stateManager.subscribe(handleStateUpdate);

    return () => {
      unsubscribe();
      unregisterHooks.forEach(unregister => unregister());
    };
  }, [stateManager, onStateChange, onError, beforeTransition, onTransitionStart, afterTransition]);

  const setDesiredState = (newState) => {
    if (validateTransition) {
      const isValid = validateTransition(stateUpdate.current, newState);
      if (!isValid) {
        const error = new Error('Invalid state transition');
        onError?.(error);
        return false;
      }
    }
    return stateManager.setDesiredState(newState);
  };

  return {
    ...stateUpdate,
    setDesiredState,
    completeTransition: stateManager.completeTransition.bind(stateManager),
    clearErrorState: stateManager.clearErrorState.bind(stateManager)
  };
};

export default useActiveState;