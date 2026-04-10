import { useState } from 'react';
import type { Sentence, View } from './types';
import { mockSentences as initialData } from './mockData';
import Navbar from './components/Navbar';
import LearnView from './views/LearnView';
import TestView from './views/TestView';
import RandomView from './views/RandomView';

function App() {
  const [sentences, setSentences] = useState<Sentence[]>(initialData);
  const [currentView, setCurrentView] = useState<View>('learn');

  const addToTest = (id: number) => {
    setSentences(prev => prev.map(s => 
      s.id === id ? { ...s, is_learning: true } : s
    ));
  };

  const handleGrade = (id: number, grade: string) => {
    console.log(`Graded sentence ${id} with ${grade}`);
    // In a real app, this would update FSRS stability/difficulty
  };

  const renderView = () => {
    switch (currentView) {
      case 'learn':
        return <LearnView sentences={sentences} addToTest={addToTest} />;
      case 'test':
        return <TestView sentences={sentences} onGrade={handleGrade} />;
      case 'random':
        return <RandomView sentences={sentences} />;
      default:
        return <LearnView sentences={sentences} addToTest={addToTest} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {renderView()}
      </main>

      <footer className="py-12 text-center text-gray-400 text-xs">
        &copy; 2026 Antigravity Language Learning. Built with TypeScript & SQLite.
      </footer>
    </div>
  );
}

export default App;
