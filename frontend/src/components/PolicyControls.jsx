import React from 'react';

const PolicyControls = () => {
  return (
    <div className="bg-panel border border-border rounded-lg p-6 w-full flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-secondary uppercase tracking-wider">Attack</label>
          <select className="bg-dark border border-border text-primary text-sm rounded px-3 py-1.5 outline-none">
            <option>Nomad</option>
            <option>Ronin</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-secondary uppercase tracking-wider">Detection Source</label>
          <select className="bg-dark border border-border text-primary text-sm rounded px-3 py-1.5 outline-none">
            <option>Hybrid</option>
            <option>Rules Only</option>
            <option>Statistical Only</option>
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-6 flex gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-secondary">Pause Delay (minutes)</label>
          <input type="number" defaultValue={0} className="bg-dark border border-border text-primary text-sm rounded px-3 py-1.5 w-24 outline-none" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-secondary">Pause Length (hours)</label>
          <input type="number" defaultValue={6} className="bg-dark border border-border text-primary text-sm rounded px-3 py-1.5 w-24 outline-none" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-secondary">Daily Rate Limit (% of TVL)</label>
          <input type="number" defaultValue={10} className="bg-dark border border-border text-primary text-sm rounded px-3 py-1.5 w-24 outline-none" />
        </div>
      </div>
    </div>
  );
};

export default PolicyControls;
