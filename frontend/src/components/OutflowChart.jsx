import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useReplay } from '../state/ReplayContext';

const OutflowChart = () => {
  const { visibleEvents, visibleAlerts } = useReplay();

  const data = useMemo(() => {
    // Group events by minute
    const minuteMap = {};
    let cumulative = 0;

    visibleEvents.forEach(e => {
      if (e.kind !== 'withdraw') return; // only track outflow
      
      const minuteStr = new Date(e.ts).toISOString().substring(11, 16);
      if (!minuteMap[minuteStr]) {
        minuteMap[minuteStr] = { time: minuteStr, outflow: 0 };
      }
      minuteMap[minuteStr].outflow += e.usd_value;
    });

    return Object.values(minuteMap);
  }, [visibleEvents]);

  return (
    <div className="bg-panel border border-border rounded-lg p-4 flex flex-col h-64 w-full">
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Outflow (USD)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#64748B" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
              itemStyle={{ color: '#F8FAFC' }}
            />
            
            {visibleAlerts.map(alert => (
              <ReferenceLine 
                key={alert.alert_id} 
                x={new Date(alert.raised_at).toISOString().substring(11, 16)} 
                stroke="#EF4444" 
                strokeDasharray="3 3"
              />
            ))}

            <Line 
              type="monotone" 
              dataKey="outflow" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OutflowChart;
