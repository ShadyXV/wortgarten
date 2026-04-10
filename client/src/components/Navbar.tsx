import React from 'react';
import type { View } from '../types';

interface NavbarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const links: { label: string; value: View }[] = [
    { label: 'Learn', value: 'learn' },
    { label: 'Test (FSRS)', value: 'test' },
    { label: 'Random', value: 'random' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Antigravity Deutsch</h1>
        <div className="flex space-x-1">
          {links.map((link) => (
            <button
              key={link.value}
              onClick={() => setCurrentView(link.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === link.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
