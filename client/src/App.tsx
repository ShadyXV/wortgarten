import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Sentence } from './types';
import { fetchLearn } from './api';
import Navbar from './components/Navbar';
import LearnView from './views/LearnView';
import TestView from './views/TestView';
import RandomView from './views/RandomView';

function App() {
  const [learnSentences, setLearnSentences] = useState<Sentence[]>([]);
  const [loadingLearn, setLoadingLearn] = useState(false);

  const loadLearnSentences = async () => {
    setLoadingLearn(true);
    try {
      const data = await fetchLearn();
      setLearnSentences(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLearn(false);
    }
  };

  // Only fetch initially if empty, otherwise manual
  useEffect(() => {
    if (learnSentences.length === 0) {
      loadLearnSentences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/learn" element={
              <LearnView 
                sentences={learnSentences} 
                setSentences={setLearnSentences}
                onRefresh={loadLearnSentences}
                loading={loadingLearn}
              />
            } />
            <Route path="/test" element={<TestView />} />
            <Route path="/random" element={<RandomView />} />
            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
        </main>

        <footer className="py-12 text-center text-gray-400 text-xs">
          &copy; 2026 Antigravity Language Learning. Built with TypeScript & SQLite.
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
