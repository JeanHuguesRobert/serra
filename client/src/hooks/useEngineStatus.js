import { useState, useEffect } from 'react';
import { useEngine } from '../contexts/EngineContext';
import { STATUS_TYPES } from '../constants/ui';

export function useEngineStatus() {
  const { engine } = useEngine();
  const [status, setStatus] = useState({
    running: false,
    statusType: STATUS_TYPES.STOPPED,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (!engine) return;

    setStatus(current => ({
      ...current,
      running: engine.running,
      statusType: engine.running ? STATUS_TYPES.RUNNING : STATUS_TYPES.STOPPED
    }));

    const subscription = engine.getStateObservable().subscribe(() => {
      setStatus({
        running: engine.running,
        statusType: engine.running ? STATUS_TYPES.RUNNING : STATUS_TYPES.STOPPED,
        timestamp: new Date().toISOString()
      });
    });

    return () => subscription.unsubscribe();
  }, [engine]);

  return status;
}
