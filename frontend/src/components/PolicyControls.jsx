import React from 'react';
import { usePolicy } from '../state/PolicyContext';

const PolicyControls = () => {
  const { humanDelay, setHumanDelay, rateLimitAmount, setRateLimitAmount, loading, runAnalysis } = usePolicy();

  return (
    <div className="bg-panel/50 backdrop-blur-xl border border-border rounded-2xl p-6 w-full flex flex-col gap-6 relative">
      {loading && (
        <div className="absolute top-4 right-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-secondary uppercase tracking-wider">Attack</label>
          <select className="bg-dark/50 border border-border text-primary text-sm rounded px-3 py-1.5 outline-none">
            <option>Nomad</option>
            <option disabled>Ronin (Soon)</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-secondary uppercase tracking-wider">Detection Source</label>
          <select className="bg-dark/50 border border-border text-primary text-sm rounded px-3 py-1.5 outline-none">
            <option>Hybrid</option>
            <option>Rules Only</option>
            <option>Statistical Only</option>
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-6 flex items-end gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-secondary">P1: Automated Pause Delay</label>
          <input type="text" value="5 seconds" disabled className="bg-dark/50 border border-border text-primary text-sm rounded px-3 py-1.5 w-32 outline-none cursor-not-allowed opacity-75" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-secondary">P2: Human Approval Delay (sec)</label>
          <input 
            type="number" 
            value={humanDelay}
            onChange={(e) => setHumanDelay(parseInt(e.target.value) || 0)}
            className="bg-dark border border-border text-primary text-sm rounded px-3 py-1.5 w-32 outline-none focus:border-tertiary" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-secondary">P3: Rate Limit (USD per 60s)</label>
          <input 
            type="number" 
            value={rateLimitAmount}
            onChange={(e) => setRateLimitAmount(parseInt(e.target.value) || 0)}
            className="bg-dark border border-border text-primary text-sm rounded px-3 py-1.5 w-40 outline-none focus:border-tertiary" 
          />
        </div>
        
        <button 
          onClick={runAnalysis}
          className="ml-auto bg-tertiary/20 hover:bg-tertiary/40 border border-tertiary/50 text-tertiary font-semibold text-sm px-6 py-2 rounded-lg transition-all"
        >
          Analyze Policy
        </button>
      </div>
    </div>
  );
};

export default PolicyControls;
