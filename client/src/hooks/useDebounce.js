// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear timeout if value changes before delay completes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useDebounceWithUtils = (initialValue, delay = 500) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  const reset = () => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
    setIsDebouncing(false);
  };

  return {
    debouncedValue,
    setValue,
    reset,
    isDebouncing,
    currentValue: value,
  };
};

export const useDebounceAsync = (asyncFn, delay = 500) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  const execute = (...args) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await asyncFn(...args);
        setResult(response);
      } catch (err) {
        setError(err);
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsLoading(false);
  };

  return {
    execute,
    cancel,
    isLoading,
    result,
    error,
  };
};

export default useDebounce;