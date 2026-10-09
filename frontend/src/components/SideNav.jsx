import React from 'react';
import { NavLink } from 'react-router-dom';
import { Play, Shield, BarChart2, Info } from 'lucide-react';

const SideNav = () => {
  const links = [
    { to: '/', icon: Play, label: 'Replay' },
    { to: '/policies', icon: Shield, label: 'Policies' },
    { to: '/scorecard', icon: BarChart2, label: 'Scorecard' },
    { to: '/about', icon: Info, label: 'About' },
  ];

  return (
    <nav className="w-64 h-screen bg-panel border-r border-border flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Vigil Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold tracking-wider text-primary uppercase">Vigil</span>
      </div>
      <div className="flex flex-col gap-2 px-4 mt-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-panel-hover text-primary'
                  : 'text-secondary hover:bg-panel-hover hover:text-primary'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default SideNav;
