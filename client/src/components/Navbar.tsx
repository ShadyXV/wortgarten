import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const links = [
    { label: 'Learn', path: '/learn' },
    { label: 'Test (FSRS)', path: '/test' },
    { label: 'Random', path: '/random' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Antigravity Deutsch</h1>
        <div className="flex space-x-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
