import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDashboard } from '../store/dashboardSlice';
import DashboardService from '../services/DashboardService';
import Dashboard from './Dashboard';

function DashboardManager({ initialDashboard }) {
  const dispatch = useDispatch();
  const currentDashboard = useSelector(state => state.dashboard.current);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialDashboard) {
      dispatch(setDashboard(initialDashboard));
      setIsInitialized(true);
    }
  }, [initialDashboard, dispatch]);

  useEffect(() => {
    const unsubscribe = DashboardService.subscribe((event, data) => {
      dispatch(setDashboard(data));
      if (event === 'response') {
        setIsInitialized(true);
      }
    });

    if (!isInitialized) {
      DashboardService.requestDashboard('first');
    }

    return () => {
      unsubscribe();
    };
  }, [dispatch, isInitialized, currentDashboard?.id]);

  return <Dashboard dashboard={currentDashboard} />;
}

export default DashboardManager;