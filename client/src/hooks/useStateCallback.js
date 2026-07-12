import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for handling state change callbacks
 * @param {Object} state - Current state object
 * @param {Function} onChange - Callback function for state changes
 */
const useStateCallback = (state, onChange) => {
  const prevStateRef = useRef(state);

  const handleStateChange = useCallback(
    (newState) => {
      const prevState = prevStateRef.current;
      if (onChange && JSON.stringify(prevState) !== JSON.stringify(newState)) {
        onChange(newState, prevState);
      }
      prevStateRef.current = newState;
    },
    [onChange]
  );

  useEffect(() => {
    handleStateChange(state);
  }, [state, handleStateChange]);

  return {
    prevState: prevStateRef.current,
    hasChanged: JSON.stringify(prevStateRef.current) !== JSON.stringify(state)
  };
};

export default useStateCallback;