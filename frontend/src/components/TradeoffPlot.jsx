import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import policiesData from '../mock/policies.json';

const TradeoffPlot = () => {
  const data = policiesData.results.map(r => ({
    name: r.policy,
    x: r.legit_delayed_usd,
    y: r.funds_saved_usd
  }));

  const COLORS = {
    'none': '#EF4444',
    'pause_first': '#10B981',
    'pause_delay': '#F59E0B',
    'rate_limit': '#3B82F6'
  };

  return (
    <div className="bg-panel border border-border rounded-lg p-4 flex flex-col h-80 w-full">
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Tradeoff: Delayed Legit Volume vs Funds Saved</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Legit Delayed" 
              stroke="#64748B" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Funds Saved" 
              stroke="#64748B" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(value, name) => [`$${(value / 1000000).toFixed(2)}M`, name]}
            />
            <Scatter name="Policies" data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748B'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradeoffPlot;
