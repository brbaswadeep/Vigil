import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

const AlertDrawer = ({ alert, isOpen, onClose }) => {
  if (!isOpen || !alert) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-dark/50 z-40"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-[450px] bg-panel border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="text-alert" />
            <div>
              <h2 className="text-lg font-bold text-primary">{alert.exploit_type}</h2>
              <span className="text-xs uppercase tracking-wider text-alert font-semibold">{alert.level} RISK - SCORE {alert.score}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          <section>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Reason</h3>
            <p className="text-primary leading-relaxed bg-dark p-4 rounded border border-border">
              {alert.reason}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Broken Rules</h3>
            <div className="flex flex-col gap-2">
              {alert.rule_hits.map((hit, idx) => (
                <div key={idx} className="bg-dark p-3 rounded border border-border flex justify-between items-center">
                  <span className="text-primary font-medium">{hit.rule}</span>
                  <span className="text-tertiary text-sm">Weight: {hit.weight}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Evidence Table</h3>
            <div className="bg-dark rounded border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-panel border-b border-border text-secondary">
                  <tr>
                    <th className="px-3 py-2 font-medium">Tx Hash</th>
                    <th className="px-3 py-2 font-medium">Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-primary font-mono text-xs">
                  {alert.rule_hits.flatMap(hit => hit.evidence.map(ev => (
                    <tr key={ev}>
                      <td className="px-3 py-2 truncate max-w-[200px]">{ev}</td>
                      <td className="px-3 py-2">{hit.rule}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Suggested Actions</h3>
            <ul className="flex flex-col gap-2">
              {alert.suggested_actions.map((action, idx) => (
                <li key={idx} className="bg-alert/10 text-alert border border-alert/30 px-4 py-2 rounded font-medium text-sm">
                  {action}
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    </>
  );
};

export default AlertDrawer;
