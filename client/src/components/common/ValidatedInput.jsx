import { TextField } from '@mui/material';

export function ValidatedInput({ 
  value, 
  onChange, 
  error, 
  onKeyPress,
  ...props 
}) {
  return (
    <TextField
      {...props}
      fullWidth
      value={value}
      error={!!error}
      helperText={error}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      variant="outlined"
      size="small"
    />
  );
}
