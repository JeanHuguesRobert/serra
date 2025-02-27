import { useState, useCallback } from 'react';

export const useLoading = (key = 'default') => {
  const [loadingStates, setLoadingStates] = useState({});
  const [loadingCounts, setLoadingCounts] = useState({});

  const isLoading = loadingStates[key] || false;

  const startLoading = useCallback(() => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setLoadingCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, [key]);

  const stopLoading = useCallback(() => {
    setLoadingCounts(prev => {
      const newCount = Math.max(0, (prev[key] || 1) - 1);
      if (newCount === 0) {
        setLoadingStates(states => ({ ...states, [key]: false }));
      }
      return { ...prev, [key]: newCount };
    });
  }, [key]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    loadingCount: loadingCounts[key] || 0
  };
};
