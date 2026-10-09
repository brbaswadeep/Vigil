import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePolicy } from '../state/PolicyContext';

const LossCurveChart = () => {
  const { data: policyData } = usePolicy();
  const data = policyData?.loss_curves || [];

  return (
    <div className="bg-panel/50 backdrop-blur-xl border border-border rounded-2xl p-6 flex flex-col h-80 w-full relative overflow-hidden">
      <h3 className="text-sm font-semibold text-primary mb-4">Loss Over Time (Millions USD)</h3>
      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="ts" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.substring(11, 16)} />
            <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}M`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(26, 26, 36, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC', borderRadius: '8px' }}
              itemStyle={{ color: '#F8FAFC' }}
              labelFormatter={(label) => label.substring(11, 19)}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
            
            <Line type="monotone" dataKey="none" name="P0: Baseline" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pause_first" name="P1: Automated Pause" stroke="#10B981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pause_delay" name="P2: Human Approval" stroke="#F59E0B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="rate_limit" name="P3: Rate Limiting" stroke="#3B82F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LossCurveChart;
