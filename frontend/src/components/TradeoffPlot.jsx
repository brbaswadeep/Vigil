import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { usePolicy } from '../state/PolicyContext';

const TradeoffPlot = () => {
  const { data: policyData } = usePolicy();
  const results = policyData?.results || [];

  const data = results.map(r => ({
    name: r.policy,
    x: r.legit_delayed_usd,
    y: r.funds_saved_usd,
    z: 1 // for constant dot size
  }));

  const COLORS = {
    'none': '#EF4444',
    'pause_first': '#10B981',
    'pause_delay': '#F59E0B',
    'rate_limit': '#3B82F6'
  };

  return (
    <div className="bg-panel/50 backdrop-blur-xl border border-border rounded-2xl p-6 flex flex-col h-full w-full relative overflow-hidden">
      <h3 className="text-sm font-semibold text-primary mb-4">Tradeoff: Delayed Legit Volume vs Funds Saved</h3>
      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Legit Delayed" 
              stroke="#52525b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Funds Saved" 
              stroke="#52525b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
            />
            <ZAxis type="number" dataKey="z" range={[100, 100]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: 'rgba(26, 26, 36, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC', borderRadius: '8px' }}
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
