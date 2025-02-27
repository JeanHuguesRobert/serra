import { Box } from '@mui/material';

export const FlexBox = ({ children, ...props }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      ...props.sx
    }}
    {...props}
  >
    {children}
  </Box>
);

export const PageContainer = ({ children, ...props }) => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...props.sx
    }}
    {...props}
  >
    {children}
  </Box>
);
