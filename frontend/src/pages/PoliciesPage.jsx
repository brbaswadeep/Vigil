import React from 'react';
import PolicyControls from '../components/PolicyControls';
import LossCurveChart from '../components/LossCurveChart';
import PolicyResultsTable from '../components/PolicyResultsTable';
import TradeoffPlot from '../components/TradeoffPlot';

const PoliciesPage = () => {
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl text-primary font-medium tracking-wide">Policy Simulator</h2>
      </div>

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
