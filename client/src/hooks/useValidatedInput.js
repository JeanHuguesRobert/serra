import { useState, useCallback } from 'react';

export function useValidatedInput(initialValue = '', validator) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);

  const handleChange = useCallback((newValue) => {
    setValue(newValue);
    if (validator) {
      const validationResult = validator(newValue);
      setError(validationResult.error);
    }
  }, [validator]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return { value, error, handleChange, reset, isValid: !error };
}
