import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  const [dataset, setDataset] = useState('nomad');
  const [chartData, setChartData] = useState({ map: {}, firstEventTs: null, lastEventTs: null });

  const ws = useRef(null);
  
  // Reconnect timeout ref
  const reconnectTimeout = useRef(null);

  // Buffer for incoming high-frequency messages
  const eventBuffer = useRef([]);
  const alertBuffer = useRef([]);
  const chartDataRef = useRef({ map: {}, firstEventTs: null, lastEventTs: null });

  // Local high alerts are now session-wise
  // No longer using firestore for these in the replay session

  // Flush buffer to state periodically (10 FPS)
  useEffect(() => {
    const timer = setInterval(() => {
      if (eventBuffer.current.length > 0) {
        const cd = chartDataRef.current;
        eventBuffer.current.forEach(e => {
          if (e.kind !== 'withdraw') return;
          const ts = new Date(e.ts).getTime();
          if (!cd.firstEventTs || ts < cd.firstEventTs) cd.firstEventTs = ts;
          if (!cd.lastEventTs || ts > cd.lastEventTs) cd.lastEventTs = ts;

          const d = new Date(ts);
          const sec = Math.floor(d.getSeconds() / 5) * 5;
          d.setSeconds(sec, 0);
          const key = d.getTime();
          
          if (!cd.map[key]) {
            cd.map[key] = { time: d.toISOString().substring(11, 19), amount: 0, ts: key };
          }
          cd.map[key].amount += (e.usd_value || 0);
        });

        setVisibleEvents(prev => [...prev, ...eventBuffer.current].slice(-100));
        setChartData({ ...cd });
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
        } else if (data.type === 'dataset') {
          setDataset(data.dataset);
        } else if (data.type === 'event') {
          eventBuffer.current.push(data.data);
        } else if (data.type === 'alert') {
          if (data.data.score > 80) {
            setHighAlerts(prev => [{ ...data.data, id: Date.now().toString() + Math.random(), resolved: false, timestamp: new Date().toISOString() }, ...prev].slice(0, 10));
            setGlobalStatus('critical');
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
    chartDataRef.current = { map: {}, firstEventTs: null, lastEventTs: null };
    setVisibleEvents([]);
    setVisibleAlerts([]);
    setHighAlerts([]);
    setChartData(chartDataRef.current);
    setGlobalStatus('safe');
  };
  
  const handleSetSpeed = (newSpeed) => {
    sendAction('speed', { value: newSpeed });
    setSpeed(newSpeed);
  };

  const loadDataset = (ds) => {
    sendAction('load_dataset', { dataset: ds });
    chartDataRef.current = { map: {}, firstEventTs: null, lastEventTs: null };
    setVisibleEvents([]);
    setVisibleAlerts([]);
    setHighAlerts([]);
    setChartData(chartDataRef.current);
    setGlobalStatus('safe');
  };

  const resolveAlert = (alertId) => {
    setHighAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    // If all are resolved, downgrade global status
    setHighAlerts(prev => {
      if (prev.every(a => a.resolved)) {
        setGlobalStatus(visibleAlerts.length > 0 ? 'alert' : 'safe');
      }
      return prev;
    });
  };

  const value = {
    currentTime,
    visibleEvents,
    visibleAlerts,
    highAlerts,
    globalStatus,
    isPlaying,
    speed,
    dataset,
    chartData,
    togglePlay,
    reset,
    setSpeed: handleSetSpeed,
    loadDataset,
    resolveAlert
  };

  return (
    <ReplayContext.Provider value={value}>
      {children}
    </ReplayContext.Provider>
  );
};
