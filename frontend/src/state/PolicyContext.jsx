import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PolicyContext = createContext();

export const usePolicy = () => useContext(PolicyContext);

export const PolicyProvider = ({ children }) => {
  const [humanDelay, setHumanDelay] = useState(30); // seconds
  const [rateLimitAmount, setRateLimitAmount] = useState(500000); // USD per 60s
  const [data, setData] = useState({ results: [], loss_curves: [] });
  const [loading, setLoading] = useState(true);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/policies?human_delay=${humanDelay}&rate_limit_amount=${rateLimitAmount}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  }, [humanDelay, rateLimitAmount]);

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <PolicyContext.Provider value={{ humanDelay, setHumanDelay, rateLimitAmount, setRateLimitAmount, data, loading, runAnalysis }}>
      {children}
    </PolicyContext.Provider>
  );
};
