import React from 'react';
import { usePolicy } from '../state/PolicyContext';

const PolicyResultsTable = () => {
  const { data: policyData } = usePolicy();
  const results = policyData?.results || [];

  return (
    <div className="bg-panel/50 backdrop-blur-xl border border-border rounded-2xl p-6 flex flex-col w-full h-full relative overflow-hidden">
      <h3 className="text-sm font-semibold text-primary mb-4">Results Table (Nomad Bridge Replay)</h3>
      <div className="overflow-x-auto flex-1 relative z-10">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-secondary border-b border-border">
            <tr>
              <th className="pb-3 pr-4 font-medium">Policy (Control)</th>
              <th className="pb-3 px-4 font-medium">Detection</th>
              <th className="pb-3 px-4 font-medium">Containment</th>
              <th className="pb-3 px-4 font-medium text-alert">Funds Lost</th>
              <th className="pb-3 px-4 font-medium text-safe">Funds Saved</th>
              <th className="pb-3 px-4 font-medium">Saved (%)</th>
              <th className="pb-3 px-4 font-medium text-alert">Legit Delayed</th>
              <th className="pb-3 px-4 font-medium">False Pause</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-primary">
            {results.map((row) => (
              <tr key={row.policy} className="hover:bg-panel-hover transition-colors">
                <td className="py-3 pr-4 font-medium">{row.policy}</td>
                <td className="py-3 px-4 text-tertiary">{row.time_to_detection}</td>
                <td className="py-3 px-4 text-tertiary">{row.time_to_containment}</td>
                <td className="py-3 px-4 text-alert font-mono">${(row.funds_lost_usd / 1000000).toFixed(2)}M</td>
                <td className="py-3 px-4 text-safe font-mono">${(row.funds_saved_usd / 1000000).toFixed(2)}M</td>
                <td className="py-3 px-4 font-mono">{row.saved_pct}%</td>
                <td className="py-3 px-4 text-alert font-mono">${(row.legit_delayed_usd / 1000000).toFixed(2)}M</td>
                <td className="py-3 px-4 text-tertiary font-mono">{row.false_pause_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolicyResultsTable;
