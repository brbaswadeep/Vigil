import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import policiesData from '../mock/policies.json';

const LossCurveChart = () => {
  const data = policiesData.loss_curves;

  return (
    <div className="bg-panel border border-border rounded-lg p-4 flex flex-col h-80 w-full">
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Loss Over Time (Millions USD)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="ts" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.substring(11, 16)} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}M`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
              itemStyle={{ color: '#F8FAFC' }}
              labelFormatter={(label) => label.substring(11, 19)}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
            
            <Line type="monotone" dataKey="none" name="No Defense" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pause_first" name="Pause First Alert" stroke="#10B981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pause_delay" name="Pause After Delay" stroke="#F59E0B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="rate_limit" name="Rate Limit" stroke="#3B82F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LossCurveChart;
