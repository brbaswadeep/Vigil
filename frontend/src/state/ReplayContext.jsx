import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ReplayContext = createContext();

export const useReplay = () => useContext(ReplayContext);

export const ReplayProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [globalStatus, setGlobalStatus] = useState('safe');

  const ws = useRef(null);
  
  // Reconnect timeout ref
  const reconnectTimeout = useRef(null);

  const connect = () => {
    ws.current = new WebSocket('ws://localhost:8000/ws');

    ws.current.onopen = () => {
      console.log('Connected to Vigil Backend');
    };

    ws.current.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        
        if (data.type === 'status') {
          setIsPlaying(data.isPlaying);
          setSpeed(data.speed);
        } else if (data.type === 'clock') {
          setCurrentTime(data.time);
        } else if (data.type === 'event') {
          setVisibleEvents(prev => [...prev, data.data].slice(-100)); // keep last 100
        } else if (data.type === 'alert') {
          setVisibleAlerts(prev => [...prev, data.data].slice(-20)); // keep last 20
          setGlobalStatus('alert');
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from Vigil Backend, retrying in 2s...');
      reconnectTimeout.current = setTimeout(connect, 2000);
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, []);

  const sendAction = (action, payload = {}) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, ...payload }));
    }
  };

  const togglePlay = () => sendAction(isPlaying ? 'pause' : 'play');
  
  const reset = () => {
    sendAction('reset');
    setVisibleEvents([]);
    setVisibleAlerts([]);
    setGlobalStatus('safe');
  };
  
  const handleSetSpeed = (newSpeed) => {
    sendAction('speed', { value: newSpeed });
    setSpeed(newSpeed);
  };

  const value = {
    currentTime,
    visibleEvents,
    visibleAlerts,
    globalStatus,
    isPlaying,
    speed,
    togglePlay,
    reset,
    setSpeed: handleSetSpeed
  };

  return (
    <ReplayContext.Provider value={value}>
      {children}
    </ReplayContext.Provider>
  );
};
