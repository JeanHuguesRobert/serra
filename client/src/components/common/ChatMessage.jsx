import { Paper, Typography } from '@mui/material';
import { MESSAGE_TYPES } from '../../constants/ui';

export function ChatMessage({ message, sender }) {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 1,
        maxWidth: '80%',
        backgroundColor: sender === MESSAGE_TYPES.USER ? 'primary.light' : 'background.paper',
        whiteSpace: sender === MESSAGE_TYPES.SYSTEM ? 'pre-wrap' : 'normal'
      }}
    >
      <Typography variant="body1" sx={{ 
        fontFamily: sender === MESSAGE_TYPES.SYSTEM ? 'monospace' : 'inherit'
      }}>
        {message}
      </Typography>
    </Paper>
  );
}
