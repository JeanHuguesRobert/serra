import { Box, CircularProgress } from '@mui/material';

export function LoadingWrapper({ loading, children, center = true }) {
  if (!loading) return children;

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: center ? 'center' : 'flex-start',
      alignItems: center ? 'center' : 'flex-start',
      p: 2,
      minHeight: 100
    }}>
      <CircularProgress />
    </Box>
  );
}
