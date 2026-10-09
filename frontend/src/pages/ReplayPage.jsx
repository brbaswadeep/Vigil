import React, { useState } from 'react';
import ReplayControls from '../components/ReplayControls';
import RiskGauge from '../components/RiskGauge';
import OutflowChart from '../components/OutflowChart';
import AlertDrawer from '../components/AlertDrawer';
import { useReplay } from '../state/ReplayContext';
import { useAuth } from '../state/AuthContext';

const ReplayPage = () => {
  const { visibleEvents, visibleAlerts, highAlerts } = useReplay();
  const { isRegular } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Maximum score in the visible alerts window
  const maxScore = visibleAlerts.reduce((max, alert) => Math.max(max, alert.score), 0);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 relative overflow-y-auto">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl text-primary font-medium tracking-wide">Live Replay Dashboard</h2>
        <ReplayControls />
      </div>

      {highAlerts.length > 0 && (
        <div className="bg-panel p-4 flex gap-4 items-center shrink-0 rounded-xl">
          <div className="flex items-center justify-center w-10 h-10 bg-dark shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="font-bold text-primary block text-base tracking-wide">CRITICAL HIGH ALERTS <span className="text-secondary text-xs font-mono ml-2">(Synced via Firestore)</span></span>
            <span className="text-secondary font-medium">
              {highAlerts.length} high-risk events detected globally (Risk &gt; 80/100). Please review immediately.
            </span>
          </div>
          <button 
            onClick={() => setSelectedAlert(highAlerts[0])}
            className="px-5 py-2.5 bg-primary text-dark font-bold hover:bg-white transition-colors rounded-lg"
          >
            Review Latest
          </button>
        </div>
      )}

      {isRegular && (
        <div className="bg-panel p-4 rounded-xl text-sm text-primary flex gap-3 items-start shrink-0">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-semibold block mb-1">Analyst Guide:</span>
            This dashboard simulates the Nomad Bridge exploit in real-time. The <strong>Risk Gauge</strong> monitors anomaly detection scores. 
            The <strong>Revenue</strong> chart shows total outbound transfers. Watch the <strong>Alerts</strong> panel for system flags when rules (like unmatched withdrawals) are violated. Click on any alert for a deep dive.
          </div>
        </div>
      )}

      <div className="flex gap-6 h-72 shrink-0">
        <RiskGauge score={maxScore} />
        <OutflowChart />
      </div>

      <div className="grid grid-cols-2 gap-6 h-[600px] shrink-0">
        {/* Alerts Column */}
        <div className="bg-panel rounded-2xl p-6 flex flex-col gap-4 overflow-hidden relative">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider shrink-0">Alerts ({visibleAlerts.length})</h3>
          <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-2 relative z-10">
            {visibleAlerts.length === 0 ? (
              <p className="text-tertiary text-sm">No alerts. Bridge behavior matches the rules.</p>
            ) : (
              visibleAlerts.slice(-100).reverse().map(alert => (
                <div 
                  key={alert.alert_id} 
                  className="p-4 bg-dark cursor-pointer hover:bg-panel transition-colors rounded-xl"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-primary">{alert.exploit_type}</span>
                    <span className="text-xs text-tertiary font-mono">{new Date(alert.raised_at).toISOString().substring(11, 19)}</span>
                  </div>
                  <p className="text-sm text-secondary">{alert.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions Column */}
        <div className="bg-panel rounded-2xl p-6 flex flex-col gap-4 overflow-hidden relative">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider shrink-0">Live Transactions ({visibleEvents.length})</h3>
          <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-2 relative z-10">
            {visibleEvents.slice(-100).reverse().map(event => (
              <div key={event.event_id} className="flex items-center justify-between p-3 bg-dark rounded-xl text-sm hover:bg-tertiary transition-colors">
                <span className="font-mono text-tertiary">{new Date(event.ts).toISOString().substring(11, 19)}</span>
                <span className="text-primary font-medium w-16">{event.kind.toUpperCase()}</span>
                <span className="font-mono text-primary flex-1 text-right pr-4">{event.amount} {event.token}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 w-24 text-center rounded ${event.status === 'matched' ? 'bg-primary text-dark' : event.status === 'unmatched' ? 'bg-secondary text-dark' : 'bg-tertiary text-dark'}`}>
                  {event.status}
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
