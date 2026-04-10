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

  useEffect(() => {
    if (learnSentences.length === 0) {
      loadLearnSentences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      {/* Deep slate background, text-slate-300 for soft white readability */}
      <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
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

        <footer className="py-12 text-center text-slate-600 text-xs font-sans relative z-10">
          &copy; 2026 Antigravity German Learning
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
