import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDashboard } from '../store/dashboardSlice';
import { socket } from '../socket';
import Dashboard from './Dashboard';

function DashboardManager({ initialDashboard }) {
  const dispatch = useDispatch();
  const currentDashboard = useSelector(state => state.dashboard.current);

  useEffect(() => {
    if (initialDashboard) {
      dispatch(setDashboard(initialDashboard));
    }
  }, [initialDashboard, dispatch]);

  useEffect(() => {
    const handleDashboardRefresh = (data) => {
      if (currentDashboard?.id === data.id) return;
      dispatch(setDashboard(data));
    };

    socket.on('dashboard-refresh', handleDashboardRefresh);
    if (!initialDashboard) {
      socket.emit('request-dashboard');
    }

    return () => socket.off('dashboard-refresh', handleDashboardRefresh);
  }, [dispatch, initialDashboard, currentDashboard?.id]);

  return <Dashboard dashboard={currentDashboard} />;
}

export default DashboardManager;