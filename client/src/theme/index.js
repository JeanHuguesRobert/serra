import { createTheme } from '@mui/material';

export const SPACING_UNIT = 8;

export const theme = createTheme({
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundColor: 'grey.100'
        }
      }
    },
    MuiBox: {
      defaultProps: {
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }
    }
  },
  spacing: SPACING_UNIT
});
