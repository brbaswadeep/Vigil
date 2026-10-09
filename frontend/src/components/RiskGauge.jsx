import React from 'react';

const RiskGauge = ({ score }) => {
  // Normalize score between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // Calculate rotation for half circle (-90deg to 90deg)
  const rotation = -90 + (normalizedScore / 100) * 180;
  
  const getRiskLevel = () => {
    if (normalizedScore < 30) return { label: 'LOW RISK', color: 'text-safe' };
    if (normalizedScore < 70) return { label: 'MEDIUM RISK', color: 'text-watch' };
    return { label: 'HIGH RISK', color: 'text-alert' };
  };

  const risk = getRiskLevel();

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-panel border border-border rounded-lg relative overflow-hidden shrink-0 h-40 w-full max-w-[280px]">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background track */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-dark box-border"></div>
        {/* Active track */}
        <div 
          className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-t-alert border-r-alert border-b-transparent border-l-transparent box-border transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        ></div>
      </div>
      
      <div className="absolute bottom-6 flex flex-col items-center">
        <span className="text-4xl font-mono font-bold text-primary">{normalizedScore}</span>
        <span className={`text-xs font-semibold tracking-wider mt-1 ${risk.color}`}>{risk.label}</span>
      </div>
    </div>
  );
};

export default RiskGauge;
