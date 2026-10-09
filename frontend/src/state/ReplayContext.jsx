import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import mockEvents from '../mock/events.json';
import mockAlerts from '../mock/alerts.json';

const ReplayContext = createContext();

export const useReplay = () => useContext(ReplayContext);

export const ReplayProvider = ({ children }) => {
  const allEvents = useMemo(() => mockEvents.sort((a, b) => new Date(a.ts) - new Date(b.ts)), []);
  const allAlerts = useMemo(() => mockAlerts.sort((a, b) => new Date(a.raised_at) - new Date(b.raised_at)), []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 10x, 100x
  const [currentTime, setCurrentTime] = useState(() => {
    return allEvents.length > 0 ? new Date(allEvents[0].ts).getTime() : Date.now();
  });

  const lastTickRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null;
      return;
    }

    let animationFrameId;
    const tick = (timestamp) => {
      if (!lastTickRef.current) lastTickRef.current = timestamp;
      const deltaMs = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      setCurrentTime((prevTime) => prevTime + deltaMs * speed);
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speed]);

  const visibleEvents = useMemo(() => {
    return allEvents.filter(e => new Date(e.ts).getTime() <= currentTime);
  }, [allEvents, currentTime]);

  const visibleAlerts = useMemo(() => {
    return allAlerts.filter(a => new Date(a.raised_at).getTime() <= currentTime);
  }, [allAlerts, currentTime]);

  const globalStatus = visibleAlerts.length > 0 ? 'UNDER ATTACK' : (visibleEvents.length > 0 ? 'WATCHING' : 'CALM');

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => {
    setIsPlaying(false);
    setCurrentTime(allEvents.length > 0 ? new Date(allEvents[0].ts).getTime() : Date.now());
  };

  return (
    <ReplayContext.Provider value={{
      isPlaying,
      speed,
      setSpeed,
      currentTime,
      visibleEvents,
      visibleAlerts,
      globalStatus,
      togglePlay,
      reset
    }}>
      {children}
    </ReplayContext.Provider>
  );
};
