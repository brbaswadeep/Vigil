import React from 'react';

const StatusChip = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'CALM':
        return 'bg-safe/20 text-safe border-safe/30';
      case 'WATCHING':
        return 'bg-watch/20 text-watch border-watch/30';
      case 'UNDER ATTACK':
        return 'bg-alert/20 text-alert border-alert/30';
      default:
        return 'bg-secondary/20 text-secondary border-secondary/30';
    }
  };

  return (
    <div className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${getStatusStyles()}`}>
      {status || 'UNKNOWN'}
    </div>
  );
};

export default StatusChip;
