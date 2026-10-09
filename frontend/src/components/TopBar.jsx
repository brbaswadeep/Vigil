import React from 'react';
import StatusChip from './StatusChip';
import { Clock } from 'lucide-react';
import { useReplay } from '../state/ReplayContext';

const TopBar = ({ incidentName }) => {
  const { currentTime, globalStatus } = useReplay();

  // Format time as HH:mm:ss based on the simulated current time (UTC)
  const timeString = new Date(currentTime).toISOString().substring(11, 19);

  return (
    <header className="h-16 bg-panel border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-primary">{incidentName || 'No Incident Selected'}</h1>
        <StatusChip status={globalStatus} />
      </div>
      
      <div className="flex items-center gap-2 text-secondary font-mono text-sm bg-dark px-4 py-2 rounded border border-border">
        <Clock size={16} className="text-tertiary" />
        <span>{timeString}</span>
      </div>
    </header>
  );
};

export default TopBar;
