import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const TopNav = () => {
  const { currentUser, role, isRegular } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Overview' },
    { to: '/policies', label: 'Policies' },
    { to: '/scorecard', label: 'Scorecard' },
    { to: '/about', label: 'About' },
  ];

  return (
    <nav className="h-20 w-full flex items-center justify-between px-8 bg-panel/50 backdrop-blur-2xl border-b border-border sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Vigil Logo" className="w-10 h-10 object-contain" />
      </div>

      {/* Center Nav Pills */}
      <div className="flex items-center gap-2 bg-[#1a1a24]/50 border border-border p-1 rounded-full backdrop-blur-md">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-6 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-dark shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-white/5'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right side placeholder (search / profile) */}
      <div className="flex items-center gap-4">
        <button onClick={handleLogout} className="text-xs text-secondary hover:text-primary transition-colors">
          Logout
        </button>
        <div className="flex items-center gap-3 bg-panel border border-border px-3 py-1.5 rounded-full">
          {!isRegular && (
            <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden">
               <img src="/logo.png" alt="User" className="w-full h-full object-cover p-1" />
            </div>
          )}
          <div className="flex flex-col pr-2">
            <span className="text-sm font-medium text-primary leading-tight">{role}</span>
            {!isRegular && (
              <span className="text-xs text-secondary leading-tight truncate w-32">{currentUser?.email}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
