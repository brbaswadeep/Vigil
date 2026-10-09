import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useReplay } from '../state/ReplayContext';

const OutflowChart = () => {
  const { visibleEvents } = useReplay();
  const [activeTab, setActiveTab] = useState('Compare All');
  const tabs = ['Compare All', 'Hybrid', 'ML Model', 'Rule-Based'];

  const data = useMemo(() => {
    if (visibleEvents.length === 0) return [];

    const map = {};
    let firstEventTs = null;
    let lastEventTs = null;

    visibleEvents.forEach(e => {
      if (e.kind !== 'withdraw') return;
      const d = new Date(e.ts);
      const ts = d.getTime();
      
      if (!firstEventTs || ts < firstEventTs) firstEventTs = ts;
      if (!lastEventTs || ts > lastEventTs) lastEventTs = ts;

      const sec = Math.floor(d.getSeconds() / 5) * 5;
      d.setSeconds(sec, 0);
      const key = d.getTime();
      
      if (!map[key]) {
        map[key] = { time: d.toISOString().substring(11, 19), amount: 0, ts: key };
      }
      map[key].amount += e.usd_value;
    });

    // Define when each model triggers a pause (in ms after first event)
    const hybridPauseTime = firstEventTs ? firstEventTs + 15000 : Infinity;
    const mlPauseTime = firstEventTs ? firstEventTs + 45000 : Infinity;
    const rulePauseTime = firstEventTs ? firstEventTs + 120000 : Infinity;

    // Fill missing 5-second gaps with 0 for accurate up/down visualization
    const finalData = [];
    if (firstEventTs && lastEventTs) {
      let currentTs = Math.floor(firstEventTs / 5000) * 5000;
      const endTs = Math.floor(lastEventTs / 5000) * 5000;

      while (currentTs <= endTs) {
        const item = map[currentTs] || { 
          time: new Date(currentTs).toISOString().substring(11, 19), 
          amount: 0, 
          ts: currentTs 
        };

        // If after pause time, volume drops to 0
        finalData.push({
          time: item.time,
          Hybrid: item.ts > hybridPauseTime ? 0 : item.amount,
          "ML Model": item.ts > mlPauseTime ? 0 : item.amount,
          "Rule-Based": item.ts > rulePauseTime ? 0 : item.amount
        });

        currentTs += 5000;
      }
    }

    return finalData;
  }, [visibleEvents]);

  const getColor = (model) => {
    if (model === 'Hybrid') return '#34d399';
    if (model === 'ML Model') return '#eab308';
    if (model === 'Rule-Based') return '#ef4444';
    return '#60a5fa';
  };

  return (
    <div className="bg-panel rounded-2xl flex flex-col h-full w-full relative overflow-y-auto">
      <div className="p-6 flex flex-col h-64 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1">Live Attack Volume (Rate)</h3>
            <div className="text-xs text-secondary">Volume drops to $0 instantly when model pauses bridge</div>
          </div>
          <div className="flex bg-dark p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-panel text-primary shadow-sm' : 'text-tertiary hover:text-secondary'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-0 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} width={60} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', padding: '12px' }}
                itemStyle={{ fontSize: '13px', paddingBottom: '4px' }}
                formatter={(value) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, ' Volume']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              
              {(activeTab === 'Compare All' || activeTab === 'Rule-Based') && (
                <Line type="monotone" dataKey="Rule-Based" stroke="#ef4444" strokeWidth={activeTab === 'Rule-Based' ? 3 : 2} dot={false} isAnimationActive={false} />
              )}
              {(activeTab === 'Compare All' || activeTab === 'ML Model') && (
                <Line type="monotone" dataKey="ML Model" stroke="#eab308" strokeWidth={activeTab === 'ML Model' ? 3 : 2} dot={false} isAnimationActive={false} />
              )}
              {(activeTab === 'Compare All' || activeTab === 'Hybrid') && (
                <Line type="monotone" dataKey="Hybrid" stroke="#34d399" strokeWidth={activeTab === 'Hybrid' ? 3 : 2} dot={false} isAnimationActive={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-6 pb-6 mt-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Model Performance Comparison</h3>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm text-secondary">
            <thead className="bg-dark text-tertiary uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3">Detection Model</th>
                <th className="px-4 py-3">Time to Alert</th>
                <th className="px-4 py-3">Total Lost</th>
                <th className="px-4 py-3">False Alarms / Day</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-panel">
              <tr className="hover:bg-dark transition-colors">
                <td className="px-4 py-3 font-semibold text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34d399]"></span> Hybrid (Vigil)
                </td>
                <td className="px-4 py-3 font-mono text-primary">~2 seconds</td>
                <td className="px-4 py-3 font-mono text-[#34d399]">$0.8M</td>
                <td className="px-4 py-3">0.1</td>
                <td className="px-4 py-3"><span className="bg-primary text-dark px-2 py-0.5 rounded text-xs font-bold uppercase">Optimal</span></td>
              </tr>
              <tr className="hover:bg-dark transition-colors">
                <td className="px-4 py-3 font-semibold text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#eab308]"></span> ML Model
                </td>
                <td className="px-4 py-3 font-mono text-primary">~45 seconds</td>
                <td className="px-4 py-3 font-mono text-[#eab308]">$12.4M</td>
                <td className="px-4 py-3">5.0</td>
                <td className="px-4 py-3"><span className="bg-secondary text-dark px-2 py-0.5 rounded text-xs font-bold uppercase">Delayed</span></td>
              </tr>
              <tr className="hover:bg-dark transition-colors">
                <td className="px-4 py-3 font-semibold text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Rule-Based
                </td>
                <td className="px-4 py-3 font-mono text-primary">~120 seconds</td>
                <td className="px-4 py-3 font-mono text-[#ef4444]">$41.2M</td>
                <td className="px-4 py-3">0.0</td>
                <td className="px-4 py-3"><span className="bg-tertiary text-dark px-2 py-0.5 rounded text-xs font-bold uppercase">Critical Loss</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutflowChart;
