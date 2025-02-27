import React from 'react';
import { Typography } from '@mui/material';

/**
 * React component for display elements
 */
const DisplayComponent = ({ id, label, value, className, element }) => {
  return (
    <div className="display-container">
      <Typography variant="subtitle1">{label}</Typography>
      <div id={id} className={className}>
        {value}
      </div>
    </div>
  );
};

export default DisplayComponent;
