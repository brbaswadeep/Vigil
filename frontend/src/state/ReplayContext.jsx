import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const ReplayContext = createContext();

export const useReplay = () => useContext(ReplayContext);

export const ReplayProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [highAlerts, setHighAlerts] = useState([]);
  const [globalStatus, setGlobalStatus] = useState('safe');

  const ws = useRef(null);
  
  // Reconnect timeout ref
  const reconnectTimeout = useRef(null);

  // Buffer for incoming high-frequency messages
  const eventBuffer = useRef([]);
  const alertBuffer = useRef([]);

  // Listen to Firestore high alerts
  useEffect(() => {
    const q = query(collection(db, "high_alerts"), orderBy("timestamp", "desc"), limit(5));
    const unsub = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach(doc => {
        alerts.push({ id: doc.id, ...doc.data() });
      });
      setHighAlerts(alerts);
      if (alerts.length > 0) {
        setGlobalStatus('critical');
      }
    });
    return () => unsub();
  }, []);

  // Flush buffer to state periodically (10 FPS)
  useEffect(() => {
    const timer = setInterval(() => {
      if (eventBuffer.current.length > 0) {
        setVisibleEvents(prev => [...prev, ...eventBuffer.current]);
        eventBuffer.current = [];
      }
      if (alertBuffer.current.length > 0) {
        setVisibleAlerts(prev => [...prev, ...alertBuffer.current].slice(-100));
        alertBuffer.current = [];
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

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
          eventBuffer.current.push(data.data);
        } else if (data.type === 'alert') {
          if (data.data.score > 80) {
            // Push to Firebase for high alerts (shared state)
            addDoc(collection(db, "high_alerts"), {
              ...data.data,
              timestamp: new Date().toISOString()
            }).catch(console.error);
          } else {
            // Normal alert, just local state
            alertBuffer.current.push(data.data);
            setGlobalStatus('alert');
          }
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
    highAlerts,
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
