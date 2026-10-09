import React from 'react';
import policiesData from '../mock/policies.json';

const PolicyResultsTable = () => {
  return (
    <div className="bg-panel border border-border rounded-lg p-4 flex flex-col w-full h-full">
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Results Table</h3>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-secondary border-b border-border">
            <tr>
              <th className="pb-3 pr-4 font-medium">Policy</th>
              <th className="pb-3 px-4 font-medium">Saved (USD)</th>
              <th className="pb-3 px-4 font-medium">Saved (%)</th>
              <th className="pb-3 px-4 font-medium">Delayed (USD)</th>
              <th className="pb-3 pl-4 font-medium">False Pauses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-primary">
            {policiesData.results.map((row) => (
              <tr key={row.policy} className="hover:bg-panel-hover transition-colors">
                <td className="py-3 pr-4 font-mono text-tertiary">{row.policy.replace('_', ' ').toUpperCase()}</td>
                <td className="py-3 px-4">${(row.funds_saved_usd / 1000000).toFixed(1)}M</td>
                <td className="py-3 px-4">{row.saved_pct}%</td>
                <td className="py-3 px-4 text-alert">${(row.legit_delayed_usd / 1000000).toFixed(2)}M</td>
                <td className="py-3 pl-4">{row.false_pauses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolicyResultsTable;
