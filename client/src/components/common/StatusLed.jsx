import { Box, Typography } from '@mui/material';
import { STATUS_COLORS } from '../../constants/ui';

export function StatusLed({ status, label, onClick, title }) {
  const ledStyle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '8px',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.3s ease',
    backgroundColor: STATUS_COLORS[status] || STATUS_COLORS.default
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        onClick={onClick}
        sx={{
          ...ledStyle,
          '&:hover': onClick ? { opacity: 0.8 } : {}
        }}
        title={title}
      />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
