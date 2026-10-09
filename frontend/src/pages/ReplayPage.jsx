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
    <div className="flex-1 flex flex-col p-6 gap-6 relative">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl text-primary font-medium tracking-wide">Live Replay Dashboard</h2>
        <ReplayControls />
      </div>

      {highAlerts.length > 0 && (
        <div className="bg-alert/10 backdrop-blur-md border border-alert/30 shadow-[0_0_20px_rgba(239,68,68,0.1)] p-4 rounded-xl text-sm flex gap-4 items-center shrink-0 relative overflow-hidden">
          {/* Subtle animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-alert/0 via-alert/5 to-alert/0 animate-shimmer"></div>
          
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-alert/20 border border-alert/40 shrink-0">
            <div className="absolute inset-0 rounded-full border border-alert animate-ping opacity-20"></div>
            <svg className="w-5 h-5 text-alert relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 relative z-10">
            <span className="font-bold text-alert block text-base tracking-wide">CRITICAL HIGH ALERTS <span className="opacity-70 text-xs font-mono ml-2">(Synced via Firestore)</span></span>
            <span className="text-alert/80 font-medium">
              {highAlerts.length} high-risk events detected globally (Risk &gt; 80/100). Please review immediately.
            </span>
          </div>
          <button 
            onClick={() => setSelectedAlert(highAlerts[0])}
            className="relative z-10 px-5 py-2.5 bg-alert/20 border border-alert/50 text-alert font-bold rounded-lg hover:bg-alert hover:text-dark transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
          >
            Review Latest
          </button>
        </div>
      )}

      {isRegular && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-sm text-primary flex gap-3 items-start shrink-0">
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

      <div className="flex gap-6 h-64 shrink-0">
        <RiskGauge score={maxScore} />
        <OutflowChart />
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Alerts Column */}
        <div className="bg-panel/50 backdrop-blur-xl border border-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden relative">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider shrink-0">Alerts ({visibleAlerts.length})</h3>
          <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-2 relative z-10">
            {visibleAlerts.length === 0 ? (
              <p className="text-tertiary text-sm">No alerts. Bridge behavior matches the rules.</p>
            ) : (
              visibleAlerts.slice().reverse().map(alert => (
                <div 
                  key={alert.alert_id} 
                  className="p-4 bg-dark/60 border border-alert/30 rounded-xl shadow-sm cursor-pointer hover:bg-alert/10 transition-colors"
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
        <div className="bg-panel/50 backdrop-blur-xl border border-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden relative">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider shrink-0">Live Transactions ({visibleEvents.length})</h3>
          <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-2 relative z-10">
            {visibleEvents.slice().reverse().map(event => (
              <div key={event.event_id} className="flex items-center justify-between p-3 bg-dark/60 border border-border/50 rounded-xl text-sm hover:border-tertiary/30 transition-colors">
                <span className="font-mono text-tertiary">{new Date(event.ts).toISOString().substring(11, 19)}</span>
                <span className="text-primary font-medium w-16">{event.kind.toUpperCase()}</span>
                <span className="font-mono text-primary flex-1 text-right pr-4">{event.amount} {event.token}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border w-24 text-center ${event.status === 'matched' ? 'border-safe/30 text-safe bg-safe/10' : event.status === 'unmatched' ? 'border-alert/30 text-alert bg-alert/10' : 'border-secondary/30 text-secondary bg-secondary/10'}`}>
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
