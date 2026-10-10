import React, { useMemo, useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useReplay } from '../state/ReplayContext';

const OutflowChart = () => {
  const { chartData, dataset } = useReplay();
  const [activeTab, setActiveTab] = useState('Compare All');
  const tabs = ['Compare All', 'Actual Attack', 'Hybrid', 'ML Model', 'Rule-Based'];

  const data = useMemo(() => {
    if (!chartData || !chartData.firstEventTs) return [];

    const { map, firstEventTs, lastEventTs } = chartData;

    // Define when each model triggers a pause (in ms after first event)
    let hybridPauseTime = Infinity;
    let mlPauseTime = Infinity;
    let rulePauseTime = Infinity;

    if (dataset === 'nomad') {
      hybridPauseTime = firstEventTs + 1000;
      mlPauseTime = firstEventTs + 45000;
      rulePauseTime = firstEventTs + 120000;
    } else {
      hybridPauseTime = firstEventTs + 1000;
      mlPauseTime = firstEventTs + 15000;
      rulePauseTime = firstEventTs + 518400000; // 6 days
    }

    const finalData = [];
    if (firstEventTs && lastEventTs) {
      const endTs = Math.floor(lastEventTs / 5000) * 5000;
      let currentTs = Math.floor(firstEventTs / 5000) * 5000; // Start from beginning for cumulative
      
      let cumActual = 0;
      let cumHybridLoss = 0, cumHybridSaved = 0;
      let cumMlLoss = 0, cumMlSaved = 0;
      let cumRuleLoss = 0, cumRuleSaved = 0;

      while (currentTs <= endTs) {
        const item = map[currentTs] || { 
          time: new Date(currentTs).toISOString().substring(11, 19), 
          amount: 0, 
          ts: currentTs 
        };

        cumActual += item.amount;
        
        if (item.ts > hybridPauseTime) cumHybridSaved += item.amount;
        else cumHybridLoss += item.amount;

        if (item.ts > mlPauseTime) cumMlSaved += item.amount;
        else cumMlLoss += item.amount;

        if (item.ts > rulePauseTime) cumRuleSaved += item.amount;
        else cumRuleLoss += item.amount;

        finalData.push({
          time: item.time,
          ts: currentTs,
          "Actual Loss": cumActual,
          "Hybrid Loss": cumHybridLoss,
          "Hybrid Saved": cumHybridSaved,
          "ML Loss": cumMlLoss,
          "ML Saved": cumMlSaved,
          "Rule Loss": cumRuleLoss,
          "Rule Saved": cumRuleSaved,
        });

        currentTs += 5000;
      }
      
      // For sliding window, return only the last 100 items (or all if we want to show the full cumulative curve)
      // Since it's a cumulative chart, seeing the full history is often better, but let's stick to the sliding window
      // so the chart doesn't get infinitely compressed.
      if (finalData.length > 100) {
        return finalData.slice(-100);
      }
    }

    return finalData;
  }, [chartData]);

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
            <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} width={60} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', padding: '12px' }}
                itemStyle={{ fontSize: '13px', paddingBottom: '4px' }}
                formatter={(value) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, ' Cumulative USD']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              
              <Line type="monotone" dataKey="Actual Loss" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} strokeDasharray="3 3" />

              {(activeTab === 'Compare All' || activeTab === 'Hybrid') && (
                <>
                  <Area type="monotone" dataKey="Hybrid Loss" stackId="hybrid" stroke="none" fill="#ef4444" fillOpacity={0.2} isAnimationActive={false} />
                  <Area type="monotone" dataKey="Hybrid Saved" stackId="hybrid" stroke="none" fill="#34d399" fillOpacity={0.4} isAnimationActive={false} />
                </>
              )}
              
              {(activeTab === 'Compare All' || activeTab === 'ML Model') && (
                <>
                  <Area type="monotone" dataKey="ML Loss" stackId="ml" stroke="none" fill="#ef4444" fillOpacity={0.1} isAnimationActive={false} />
                  <Area type="monotone" dataKey="ML Saved" stackId="ml" stroke="none" fill="#eab308" fillOpacity={0.3} isAnimationActive={false} />
                </>
              )}

              {(activeTab === 'Compare All' || activeTab === 'Rule-Based') && (
                <>
                  <Area type="monotone" dataKey="Rule Loss" stackId="rule" stroke="none" fill="#ef4444" fillOpacity={0.1} isAnimationActive={false} />
                  <Area type="monotone" dataKey="Rule Saved" stackId="rule" stroke="none" fill="#f97316" fillOpacity={0.3} isAnimationActive={false} />
                </>
              )}
            </ComposedChart>
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
