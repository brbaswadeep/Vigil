import React from 'react';
import { useReplay } from '../state/ReplayContext';
import { Play, Pause, RotateCcw, FastForward, Database } from 'lucide-react';

const ReplayControls = () => {
  const { isPlaying, togglePlay, reset, speed, setSpeed, dataset, loadDataset } = useReplay();

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  const handleDatasetChange = (e) => {
    loadDataset(e.target.value);
  };

  return (
    <div className="flex items-center gap-4 bg-panel px-4 py-2 rounded-lg shrink-0">
      <div className="flex items-center gap-2 mr-2 border-r border-border pr-6">
        <Database size={16} className="text-secondary" />
        <select 
          value={dataset}
          onChange={handleDatasetChange}
          className="bg-dark border border-border text-primary text-sm font-semibold rounded px-2 py-1.5 outline-none focus:border-tertiary"
        >
          <option value="nomad">Nomad Bridge</option>
          <option value="ronin">Ronin Network</option>
        </select>
      </div>

      <button 
        onClick={togglePlay}
        className="flex items-center gap-2 px-3 py-1.5 bg-dark rounded hover:bg-tertiary text-primary transition-colors"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        <span className="text-sm font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      <button 
        onClick={reset}
        className="flex items-center gap-2 px-3 py-1.5 bg-dark rounded hover:bg-tertiary text-secondary transition-colors"
      >
        <RotateCcw size={18} />
        <span className="text-sm font-medium text-primary">Reset</span>
      </button>

      <div className="flex items-center gap-2 ml-4">
        <FastForward size={18} className="text-secondary" />
        <select 
          value={speed}
          onChange={handleSpeedChange}
          className="bg-dark border border-border text-primary text-sm rounded px-2 py-1.5 outline-none focus:border-tertiary"
        >
          <option value={1}>1x Speed</option>
          <option value={10}>10x Speed</option>
          <option value={100}>100x Speed</option>
          <option value={1000}>1000x Speed</option>
        </select>
      </div>
    </div>
  );
};

export default ReplayControls;
