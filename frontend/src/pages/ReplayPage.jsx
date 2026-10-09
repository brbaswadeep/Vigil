import React, { useState } from 'react';
import ReplayControls from '../components/ReplayControls';
import RiskGauge from '../components/RiskGauge';
import OutflowChart from '../components/OutflowChart';
import AlertDrawer from '../components/AlertDrawer';
import { useReplay } from '../state/ReplayContext';

const ReplayPage = () => {
  const { visibleEvents, visibleAlerts } = useReplay();
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Maximum score in the visible alerts window
  const maxScore = visibleAlerts.reduce((max, alert) => Math.max(max, alert.score), 0);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 relative">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl text-primary font-medium tracking-wide">Live Replay Dashboard</h2>
        <ReplayControls />
      </div>

      <div className="flex gap-6 h-64 shrink-0">
        <RiskGauge score={maxScore} />
        <OutflowChart />
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Alerts Column */}
        <div className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-lg font-semibold text-secondary uppercase tracking-wider shrink-0">Alerts ({visibleAlerts.length})</h3>
          <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-2">
            {visibleAlerts.length === 0 ? (
              <p className="text-tertiary">No alerts. Bridge behavior matches the rules.</p>
            ) : (
              visibleAlerts.slice().reverse().map(alert => (
                <div 
                  key={alert.alert_id} 
                  className="p-4 bg-dark border border-alert/30 rounded-md shadow-sm cursor-pointer hover:bg-panel-hover transition-colors"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-alert">{alert.exploit_type}</span>
                    <span className="text-xs text-tertiary font-mono">{new Date(alert.raised_at).toISOString().substring(11, 19)}</span>
                  </div>
                  <p className="text-sm text-secondary">{alert.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions Column */}
        <div className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-lg font-semibold text-secondary uppercase tracking-wider shrink-0">Live Transactions ({visibleEvents.length})</h3>
          <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-2">
            {visibleEvents.slice().reverse().map(event => (
              <div key={event.event_id} className="flex items-center justify-between p-3 bg-dark border border-border rounded-md text-sm">
                <span className="font-mono text-tertiary">{new Date(event.ts).toISOString().substring(11, 19)}</span>
                <span className="text-primary font-medium w-16">{event.kind.toUpperCase()}</span>
                <span className="font-mono text-primary flex-1 text-right pr-4">{event.amount} {event.token}</span>
                <span className={`text-xs px-2 py-1 rounded-full border w-24 text-center ${event.status === 'matched' ? 'border-safe/30 text-safe bg-safe/10' : event.status === 'unmatched' ? 'border-alert/30 text-alert bg-alert/10' : 'border-secondary/30 text-secondary bg-secondary/10'}`}>
                  {event.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDrawer 
        alert={selectedAlert} 
        isOpen={!!selectedAlert} 
        onClose={() => setSelectedAlert(null)} 
      />
    </div>
  );
};

export default ReplayPage;
