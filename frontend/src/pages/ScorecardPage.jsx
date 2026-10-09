import React from 'react';
import ScorecardTable from '../components/ScorecardTable';

const ScorecardPage = () => {
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl text-primary font-medium tracking-wide">Evaluation Scorecard</h2>
      </div>

      <ScorecardTable />
    </div>
  );
};

export default ScorecardPage;
