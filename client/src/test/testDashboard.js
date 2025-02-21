export const testDashboard = {
  id: 'test-dashboard',
  components: [
    {
      id: 'temp-display',
      type: 'display',
      label: 'Temperature'
    },
    {
      id: 'temp-input',
      type: 'input',
      label: 'Set Temperature'
    },
    {
      id: 'details-link',
      type: 'dashboard-link',
      label: 'View Details',
      targetId: 'details-dashboard'
    }
  ]
};