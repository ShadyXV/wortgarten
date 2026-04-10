import React from 'react';
import { NavLink } from 'react-router-dom';
import { Terminal, Cpu, Shuffle } from 'lucide-react';

const Navbar: React.FC = () => {
  const links = [
    { label: 'Learn', path: '/learn', icon: <Terminal className="w-4 h-4" /> },
    { label: 'Review', path: '/test', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Practice', path: '/random', icon: <Shuffle className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-slate-950/90 border-b border-slate-800 px-6 py-4 sticky top-0 z-20 backdrop-blur-md transition-all duration-200">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-sans font-semibold text-slate-200 tracking-wide">
            Antigravity
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans transition-all duration-200 border ${
                  isActive
                    ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.05)]'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`
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
