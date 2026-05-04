import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sentence } from '../types';
import { fetchDueTest, submitReview, fetchTestCounts } from '../api';
import { Cog, Volume2, Settings, Play, Activity, Target, BarChart3, CheckCircle, Leaf } from 'lucide-react';
import EditSentenceModal from '../components/EditSentenceModal';

type TestSentence = Sentence & {
  _isRetried?: boolean;
};

const TestView: React.FC = () => {
  const navigate = useNavigate();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'all' | 'again' | 'hard' | 'good' | 'easy'>('all');
  
  const [testSentences, setTestSentences] = useState<TestSentence[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ all: 0, again: 0, hard: 0, good: 0, easy: 0 });
  
  // HUD Stats & Timers
  const [sessionStats, setSessionStats] = useState({ 
    totalInitial: 0,
    completed: 0, 
    retries: 0,
    firstTryCorrect: 0
  });
  const [startTime, setStartTime] = useState(() => Date.now());

  useEffect(() => {
    if (!sessionStarted) {
      fetchTestCounts().then(setCounts).catch(console.error);
    }
  }, [sessionStarted]);

  const startSession = () => {
    setLoading(true);
    setSessionStarted(true);
    fetchDueTest(selectedMode)
      .then(sentences => {
        setTestSentences(sentences);
        setSessionStats({
          totalInitial: sentences.length,
          completed: 0,
          retries: 0,
          firstTryCorrect: 0
        });
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setStartTime(Date.now());
      });
  };

  const currentSentence = testSentences[0];

  const handleGrade = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentSentence) return;
    const ratingMap = { again: 1, hard: 2, good: 3, easy: 4 } as const;
    const numericRating = ratingMap[grade];
    const timeTakenMs = Date.now() - startTime;
    const isFirstTry = !currentSentence._isRetried;

    try {
      // Await backend to get true ts-fsrs mathematical calculations
      const response = await submitReview(currentSentence.id, numericRating, timeTakenMs);
      const newMetrics = response.metrics;

      setTestSentences(prev => {
        const remaining = prev.slice(1);
        
        // Ensure "ONE final check" to avoid infinite queue loops
        if ((numericRating === 1 || numericRating === 2) && isFirstTry) {
          const insertIndex = Math.min(numericRating === 1 ? 3 : 8, remaining.length);
          const nextQueue = [...remaining];
          
          // Use the exact mathematical state returned by true FSRS algorithm
          nextQueue.splice(insertIndex, 0, { 
            ...currentSentence, 
            ...newMetrics,
            _isRetried: true 
          });
          return nextQueue;
        }
        
        return remaining;
      });

      setSessionStats(prev => ({
        ...prev,
        completed: numericRating >= 3 ? prev.completed + 1 : prev.completed,
        retries: numericRating < 3 ? prev.retries + 1 : prev.retries,
        firstTryCorrect: (isFirstTry && numericRating >= 3) ? prev.firstTryCorrect + 1 : prev.firstTryCorrect
      }));

      setIsRevealed(false);
      setStartTime(Date.now()); 
    } catch (error) {
      console.error('Queue update failed:', error);
    }
  };

  const handleUpdateSentence = (
    id: number, 
    newEnglish: string, 
    newGerman: string, 
    newDifficulty?: number,
    newIsLearning?: number
  ) => {
    setTestSentences(prev =>
      prev.map(s =>
        s.id === id 
          ? { 
              ...s, 
              english: newEnglish, 
              german: newGerman, 
              fsrs_difficulty: newDifficulty ?? s.fsrs_difficulty,
              is_learning: newIsLearning ?? s.is_learning
            } 
          : s
      )
    );
  };

  const playAudio = (filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = new Audio(`/audio/${filename}`);
    audio.play().catch(err => console.error("Audio playback failed", err));
  };

  if (!sessionStarted) {
    return (
      <div className="wg-page max-w-xl py-10 transition-all duration-200">
        <div className="wg-page-header mb-8">
          <div className="wg-kicker">
          <Settings className="w-5 h-5" />
            <h1>Sitzung einrichten</h1>
          </div>
        </div>

        <div className="wg-panel p-8 space-y-8">
          <p className="text-center wg-subtle text-sm">
            Select a target difficulty mode for your upcoming review session.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedMode('all')}
              className={`w-full md:col-span-2 flex items-center justify-between gap-4 p-5 rounded-[8px] border transition-all duration-200 text-left ${
                selectedMode === 'all' 
                  ? 'wg-panel-selected text-[var(--wg-gold)]'
                  : 'border-[rgba(212,175,55,0.18)] bg-[rgba(8,15,21,0.28)] text-[rgba(235,227,214,0.72)] hover:border-[rgba(212,175,55,0.38)] hover:bg-[rgba(235,227,214,0.04)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Leaf className="w-6 h-6" />
                <div className="flex flex-col items-start">
                  <span className="wg-serif text-xl">Standard</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] opacity-70">All Due Cards</span>
                </div>
              </div>
              <span className="text-2xl wg-tabular">{counts.all}</span>
            </button>

            <button
              onClick={() => setSelectedMode('again')}
              className={`w-full flex items-center justify-between p-4 rounded-[8px] border transition-all duration-200 text-left ${
                selectedMode === 'again' 
                  ? 'border-[rgba(229,101,94,0.58)] bg-[rgba(229,101,94,0.1)] text-[var(--wg-coral)]'
                  : 'border-[rgba(212,175,55,0.18)] bg-[rgba(8,15,21,0.28)] text-[rgba(235,227,214,0.68)] hover:border-[rgba(229,101,94,0.34)] hover:bg-[rgba(229,101,94,0.06)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="wg-serif text-lg">Again Focus</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] opacity-70">Difficulty &gt; 7.0</span>
                </div>
              </div>
              <span className="text-xl wg-tabular">{counts.again}</span>
            </button>

            <button
              onClick={() => setSelectedMode('hard')}
              className={`w-full flex items-center justify-between p-4 rounded-[8px] border transition-all duration-200 text-left ${
                selectedMode === 'hard' 
                  ? 'border-[rgba(224,122,95,0.58)] bg-[rgba(224,122,95,0.1)] text-[var(--wg-copper)]'
                  : 'border-[rgba(212,175,55,0.18)] bg-[rgba(8,15,21,0.28)] text-[rgba(235,227,214,0.68)] hover:border-[rgba(224,122,95,0.34)] hover:bg-[rgba(224,122,95,0.06)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="wg-serif text-lg">Hard Focus</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] opacity-70">Difficulty 5.1 - 7.0</span>
                </div>
              </div>
              <span className="text-xl wg-tabular">{counts.hard}</span>
            </button>

            <button
              onClick={() => setSelectedMode('good')}
              className={`w-full flex items-center justify-between p-4 rounded-[8px] border transition-all duration-200 text-left ${
                selectedMode === 'good' 
                  ? 'border-[rgba(29,182,167,0.58)] bg-[rgba(29,182,167,0.1)] text-[var(--wg-teal)]'
                  : 'border-[rgba(212,175,55,0.18)] bg-[rgba(8,15,21,0.28)] text-[rgba(235,227,214,0.68)] hover:border-[rgba(29,182,167,0.34)] hover:bg-[rgba(29,182,167,0.06)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="wg-serif text-lg">Good Review</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] opacity-70">Difficulty 3.1 - 5.0</span>
                </div>
              </div>
              <span className="text-xl wg-tabular">{counts.good}</span>
            </button>

            <button
              onClick={() => setSelectedMode('easy')}
              className={`w-full flex items-center justify-between p-4 rounded-[8px] border transition-all duration-200 text-left ${
                selectedMode === 'easy' 
                  ? 'border-[rgba(127,183,117,0.58)] bg-[rgba(127,183,117,0.1)] text-[var(--wg-linden)]'
                  : 'border-[rgba(212,175,55,0.18)] bg-[rgba(8,15,21,0.28)] text-[rgba(235,227,214,0.68)] hover:border-[rgba(127,183,117,0.34)] hover:bg-[rgba(127,183,117,0.06)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="wg-serif text-lg">Easy Review</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] opacity-70">Difficulty &le; 3.0</span>
                </div>
              </div>
              <span className="text-xl wg-tabular">{counts.easy}</span>
            </button>
          </div>

          <button
            onClick={startSession}
            className="wg-btn wg-btn-primary w-full py-4"
          >
            <Play className="w-4 h-4" />
            Initialize Session
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-[var(--wg-gold)] animate-pulse tracking-widest text-sm uppercase">Loading Review...</div>;
  }

  if (testSentences.length === 0) {
    if (sessionStats.totalInitial > 0) {
      // Show Session Completion Summary
      const retentionRate = Math.round((sessionStats.firstTryCorrect / sessionStats.totalInitial) * 100);
      
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="wg-panel p-8 inline-block w-full max-w-md">
            <Activity className="w-12 h-12 text-[var(--wg-linden)] mb-4 mx-auto" />
            <h2 className="wg-serif text-2xl font-medium text-[var(--wg-ivory)] tracking-wide mb-6">Session Complete</h2>
            
            <div className="space-y-4 mb-8 text-left bg-[rgba(8,15,21,0.34)] p-4 rounded-[8px] border border-[rgba(212,175,55,0.16)]">
              <div className="flex justify-between items-center">
                <span className="text-sm wg-subtle">Unique Cards Reviewed:</span>
                <span className="wg-tabular text-[var(--wg-gold)]">{sessionStats.totalInitial}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm wg-subtle">First-Try Retention:</span>
                <span className="wg-tabular text-[var(--wg-linden)]">{retentionRate}%</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setSessionStarted(false)} 
                className="wg-btn"
              >
                New Session
              </button>
              <button 
                onClick={() => navigate('/stats')} 
                className="wg-btn wg-btn-secondary"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default Empty Queue
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="wg-panel p-8 inline-block max-w-md">
          <Cog className="w-12 h-12 text-[var(--wg-gold)] mb-4 mx-auto" />
          <h2 className="wg-serif text-2xl font-medium text-[var(--wg-ivory)] tracking-wide">Queue Empty</h2>
          
          <p className="wg-subtle mt-4 text-sm">
            {selectedMode === 'all' 
              ? "All due reviews for today are completed." 
              : `No cards currently match the "${selectedMode}" difficulty threshold.`}
          </p>

          {selectedMode !== 'all' && (
            <p className="text-[rgba(235,227,214,0.42)] mt-4 text-xs italic">
              Cards naturally filter into Hard and Easy categories as you review them in Standard mode. Keep studying!
            </p>
          )}
          
          <button 
            onClick={() => setSessionStarted(false)} 
            className="wg-btn mt-8 mx-auto"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  const againCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) > 7.0).length;
  const hardCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) > 5.0 && (s.fsrs_difficulty || 5.0) <= 7.0).length;
  const goodCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) > 3.0 && (s.fsrs_difficulty || 5.0) <= 5.0).length;
  const easyCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) <= 3.0).length;

  return (
    <div className="wg-page max-w-2xl py-8 transition-all duration-200">
      <div className="wg-page-header mb-6">
        <div className="wg-kicker">
          <Cog className="w-5 h-5" />
          <h1>Review: {selectedMode}</h1>
        </div>
      </div>

      <div className="wg-panel wg-flashcard p-8 relative overflow-hidden transition-all duration-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 border-b border-[rgba(212,175,55,0.14)] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs wg-subtle">Queue: <span className="wg-tabular text-[var(--wg-ivory)]">{testSentences.length}</span></span>
            <EditSentenceModal
              id={currentSentence.id}
              initialEnglish={currentSentence.english}
              initialGerman={currentSentence.german}
              initialDifficulty={currentSentence.fsrs_difficulty || 5.0}
              initialIsLearning={currentSentence.is_learning}
              onUpdate={handleUpdateSentence}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="wg-label hidden md:inline">Complexity:</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="wg-badge wg-badge-again">
                Again: {againCount}
              </span>
              <span className="wg-badge wg-badge-hard">
                Hard: {hardCount}
              </span>
              <span className="wg-badge wg-badge-good">
                Good: {goodCount}
              </span>
              <span className="wg-badge wg-badge-easy">
                Easy: {easyCount}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-10">
          
          <div className="space-y-3 w-full">
            <p className="wg-label">English</p>
            <p className="text-2xl text-[var(--wg-ivory)] font-medium tracking-tight leading-snug">
              {currentSentence.english}
            </p>
          </div>

          <div className="w-full pt-6 space-y-6 min-h-[160px] flex flex-col justify-center">
            {isRevealed ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <audio src={`/audio/${currentSentence.audio}`} autoPlay className="hidden" />
                
                <p className="wg-label">German</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                  <p className="wg-german text-4xl text-[var(--wg-gold)] tracking-tight">
                    {currentSentence.german}
                  </p>
                  <button
                    onClick={(e) => playAudio(currentSentence.audio, e)}
                    className="wg-icon-btn"
                    title="Play Audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs wg-subtle mt-2">
                  Focus: <span className="text-[var(--wg-linden)]">{currentSentence.source_word_de}</span>
                </p>
              </div>
            ) : (
              <button
                onClick={() => setIsRevealed(true)}
                className="wg-btn wg-btn-secondary mx-auto px-8 py-3"
              >
                Show Answer
              </button>
            )}
          </div>
        </div>

        {isRevealed && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 pt-6 border-t border-[rgba(212,175,55,0.14)] animate-in slide-in-from-bottom-2 duration-200">
            <button onClick={() => handleGrade('again')} className="wg-btn wg-btn-danger">Again</button>
            <button onClick={() => handleGrade('hard')} className="wg-btn wg-btn-secondary">Hard</button>
            <button onClick={() => handleGrade('good')} className="wg-btn wg-btn-success">Good</button>
            <button onClick={() => handleGrade('easy')} className="wg-btn">Easy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestView;
