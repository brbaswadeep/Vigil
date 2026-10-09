import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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
    <div className="bg-panel border border-border rounded-2xl p-6 flex flex-col h-64 w-full relative overflow-hidden">
      <h3 className="text-sm font-semibold text-primary mb-1">Revenue</h3>
      <div className="text-xs text-secondary mb-4">Outflow (USD)</div>
      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#52525b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(26, 26, 36, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC', borderRadius: '8px' }}
              itemStyle={{ color: '#F8FAFC' }}
            />
            
            {visibleAlerts.map(alert => (
              <ReferenceLine 
                key={alert.alert_id} 
                x={new Date(alert.raised_at).toISOString().substring(11, 16)} 
                stroke="#f43f5e" 
                strokeDasharray="3 3"
              />
            ))}

            <Area 
              type="monotone" 
              dataKey="outflow" 
              stroke="#c084fc" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOutflow)"
              activeDot={{ r: 6, fill: "#c084fc", stroke: "#0a0a0c", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OutflowChart;
