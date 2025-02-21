import { createSlice } from '@reduxjs/toolkit';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    current: null,
    loading: false,
    error: null
  },
  reducers: {
    setDashboard: (state, action) => {
      state.current = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateDashboardValue: (state, action) => {
      const { componentId, value } = action.payload;
      if (state.current) {
        const component = state.current.content.components.find(c => c.id === componentId);
        if (component) {
          component.value = value;
        }
      }
    },
    setLoading: (state) => {
      state.loading = true;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setDashboard, updateDashboardValue, setLoading, setError } = dashboardSlice.actions;
export default dashboardSlice.reducer;