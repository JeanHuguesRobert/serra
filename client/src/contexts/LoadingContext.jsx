import React, { createContext, useContext, useReducer } from 'react';

const LoadingContext = createContext();

const loadingReducer = (state, action) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, [action.key]: true };
    case 'STOP_LOADING':
      return { ...state, [action.key]: false };
    default:
      return state;
  }
};

export function LoadingProvider({ children }) {
  const [loadingState, dispatch] = useReducer(loadingReducer, {});

  const startLoading = (key) => dispatch({ type: 'START_LOADING', key });
  const stopLoading = (key) => dispatch({ type: 'STOP_LOADING', key });

  return (
    <LoadingContext.Provider value={{ loadingState, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = (key) => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  
  return {
    isLoading: context.loadingState[key] || false,
    startLoading: () => context.startLoading(key),
    stopLoading: () => context.stopLoading(key)
  };
};
