import React, { useState, useEffect } from 'react';
import { TextField, Typography } from '@mui/material';
import { useEngine } from '../../contexts/EngineContext';

/**
 * React component for number input elements
 */
const NumberInputComponent = ({ id, label, value, min, max, step, element }) => {
  const [inputValue, setInputValue] = useState(value);
  const engine = useEngine();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setInputValue(newValue);
    if (engine) {
      engine.engine.updateElement(id, 'value', newValue);
    }
  };

  return (
    <div className="number-input-container">
      <Typography variant="subtitle1">{label}</Typography>
      <TextField
        id={id}
        type="number"
        value={inputValue}
        onChange={handleChange}
        inputProps={{
          min: min,
          max: max,
          step: step
        }}
      />
    </div>
  );
};

export default NumberInputComponent;
