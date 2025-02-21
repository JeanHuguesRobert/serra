import React, { createContext, useContext } from 'react';
import { WebRenderer } from '../renderers/WebRenderer';

const EngineContext = createContext(null);

export function EngineProvider({ children }) {
  const renderer = new WebRenderer();

  return (
    <EngineContext.Provider value={renderer}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine() {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return context;
}