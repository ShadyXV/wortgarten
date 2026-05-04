import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Sentence } from './types';
import { fetchLearn } from './api';
import Navbar from './components/Navbar';
import LearnView from './views/LearnView';
import TestView from './views/TestView';
import RandomView from './views/RandomView';
import StatsView from './views/StatsView';
import ManageView from './views/ManageView';

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
      <div className="wg-app-shell selection:bg-[rgba(127,183,117,0.28)] selection:text-[var(--wg-ivory)]">
        <Navbar />
        
        <main className="wg-main">
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
            <Route path="/stats" element={<StatsView />} />
            <Route path="/manage" element={<ManageView />} />
            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
        </main>

        <footer className="wg-footer">
          &copy; 2026 Wortgarten German Learning
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
