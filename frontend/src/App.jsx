import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SideNav from './components/SideNav';
import TopBar from './components/TopBar';
import ReplayPage from './pages/ReplayPage';
import PoliciesPage from './pages/PoliciesPage';
import ScorecardPage from './pages/ScorecardPage';
import AboutPage from './pages/AboutPage';

const App = () => {
  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-dark">
        <SideNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar incidentName="Nomad Bridge Replay" />
          <main className="flex-1 overflow-hidden flex flex-col">
            <Routes>
              <Route path="/" element={<ReplayPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/scorecard" element={<ScorecardPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
