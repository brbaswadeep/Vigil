import React from 'react';
import PolicyControls from '../components/PolicyControls';
import LossCurveChart from '../components/LossCurveChart';
import PolicyResultsTable from '../components/PolicyResultsTable';
import TradeoffPlot from '../components/TradeoffPlot';
import { useAuth } from '../state/AuthContext';

const PoliciesPage = () => {
  const { isRegular } = useAuth();

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl text-primary font-medium tracking-wide">Policy Simulator</h2>
      </div>

      {isRegular && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-sm text-primary flex gap-3 items-start shrink-0">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-semibold block mb-1">Analyst Guide:</span>
            Use the controls below to simulate different incident response policies. 
            Adjusting the <strong>Pause Delay</strong> tests how quickly the bridge stops after an alert. 
            The <strong>Loss Curve</strong> below predicts how much volume would be saved vs. lost under those policies.
          </div>
        </div>
      )}

      <PolicyControls />

      <LossCurveChart />

      <div className="flex gap-6 h-[350px] shrink-0">
        <div className="flex-1 min-w-0">
          <PolicyResultsTable />
        </div>
        <div className="flex-1 min-w-0">
          <TradeoffPlot />
        </div>
      </div>

      <div className="text-tertiary text-xs text-center mt-4">
        * Results come from replaying the Nomad incident and normal traffic data. They are not a general claim about all bridges.
      </div>
    </div>
  );
};

export default PoliciesPage;
