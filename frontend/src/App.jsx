import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import TopNav from './components/TopNav';
import TopBar from './components/TopBar';
import ReplayPage from './pages/ReplayPage';
import PoliciesPage from './pages/PoliciesPage';
import ScorecardPage from './pages/ScorecardPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-transparent">
      <TopNav />
      <TopBar incidentName="Nomad Bridge Replay" />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/" element={<ReplayPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/scorecard" element={<ScorecardPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
