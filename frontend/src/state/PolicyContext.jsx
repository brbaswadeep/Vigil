import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useReplay } from './ReplayContext';

const PolicyContext = createContext();

export const usePolicy = () => useContext(PolicyContext);

export const PolicyProvider = ({ children }) => {
  const [humanDelay, setHumanDelay] = useState(30); // seconds
  const [rateLimitAmount, setRateLimitAmount] = useState(500000); // USD per 60s
  const [data, setData] = useState({ results: [], loss_curves: [] });
  const [loading, setLoading] = useState(true);
  const { dataset } = useReplay();

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      // Actually backend handles the dataset context directly but wait! 
      // The backend gets the dataset from the websocket global state. 
      // The REST API (`/api/policies`) uses the same global `current_dataset` state. 
      // So when the dataset changes via websocket, the next API call will use the new dataset!
      // This is perfect, we just need to retrigger the fetch when `dataset` changes in React.
      const response = await fetch(`http://localhost:8000/api/policies?human_delay=${humanDelay}&rate_limit_amount=${rateLimitAmount}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  }, [humanDelay, rateLimitAmount, dataset]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  return (
    <PolicyContext.Provider value={{ humanDelay, setHumanDelay, rateLimitAmount, setRateLimitAmount, data, loading, runAnalysis }}>
      {children}
    </PolicyContext.Provider>
  );
};
