import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Sprout, Shuffle, Activity, Database, Cog } from 'lucide-react';

const Navbar: React.FC = () => {
  const links = [
    { label: 'Learn', path: '/learn', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Review', path: '/test', icon: <Cog className="w-4 h-4" /> },
    { label: 'Practice', path: '/random', icon: <Shuffle className="w-4 h-4" /> },
    { label: 'Stats', path: '/stats', icon: <Activity className="w-4 h-4" /> },
    { label: 'Manage', path: '/manage', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <nav className="wg-nav">
      <div className="wg-nav-inner">
        <div className="wg-brand">
          <span className="wg-brand-mark" aria-hidden="true">
            <Sprout className="w-5 h-5" />
          </span>
          <h1 className="wg-brand-name">
            Wortgarten
          </h1>
        </div>
        
        <div className="wg-nav-links">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `wg-nav-link ${isActive ? 'wg-nav-link-active' : ''}`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
