import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sentence } from '../types';
import { fetchDueTest, submitReview, fetchTestCounts } from '../api';
import { Cpu, Volume2, Target, Settings, Play, Activity } from 'lucide-react';

const TestView: React.FC = () => {
  const navigate = useNavigate();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'all' | 'again' | 'hard' | 'good' | 'easy'>('all');
  
  const [testSentences, setTestSentences] = useState<Sentence[]>([]);
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
  const [startTime, setStartTime] = useState(Date.now());

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
    const isFirstTry = !(currentSentence as any)._isRetried;

    try {
      submitReview(currentSentence.id, numericRating, timeTakenMs).catch(error => {
        console.error('Failed to submit review sync:', error);
      });

      setTestSentences(prev => {
        const remaining = prev.slice(1);
        
        // Ensure "ONE final check" to avoid infinite queue loops
        if ((numericRating === 1 || numericRating === 2) && isFirstTry) {
          const insertIndex = Math.min(numericRating === 1 ? 3 : 8, remaining.length);
          const nextQueue = [...remaining];
          
          // Optimistically update difficulty so HUD accurately reflects new state
          let newDiff = currentSentence.fsrs_difficulty || 5.0;
          if (numericRating === 1) newDiff = Math.min(10, newDiff + 2);
          if (numericRating === 2) newDiff = Math.min(10, newDiff + 1);

          nextQueue.splice(insertIndex, 0, { 
            ...currentSentence, 
            fsrs_difficulty: newDiff,
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

  const playAudio = (filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = new Audio(`/audio/${filename}`);
    audio.play().catch(err => console.error("Audio playback failed", err));
  };

  if (!sessionStarted) {
    return (
      <div className="max-w-xl mx-auto py-12 transition-all duration-200">
        <div className="flex items-center justify-center gap-3 mb-10 text-cyan-400/80">
          <Settings className="w-5 h-5" />
          <h1 className="text-sm font-sans tracking-widest uppercase">Session Setup</h1>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-8 glass-panel space-y-8">
          <p className="text-center font-sans text-slate-400 text-sm">
            Select a target difficulty mode for your upcoming review session.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedMode('all')}
              className={`w-full md:col-span-2 flex items-center justify-between p-4 rounded-md border transition-all duration-200 ${
                selectedMode === 'all' 
                  ? 'bg-slate-800/80 border-cyan-500/50 text-cyan-400' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-sans font-medium">Standard</span>
                <span className="text-[10px] font-mono uppercase opacity-70">All Due Cards</span>
              </div>
              <span className="text-lg font-mono">{counts.all}</span>
            </button>

            <button
              onClick={() => setSelectedMode('again')}
              className={`w-full flex items-center justify-between p-4 rounded-md border transition-all duration-200 ${
                selectedMode === 'again' 
                  ? 'bg-slate-800/80 border-rose-500/50 text-rose-400' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-sans font-medium">Again Focus</span>
                <span className="text-[10px] font-mono uppercase opacity-70">Difficulty &ge; 8.0</span>
              </div>
              <span className="text-lg font-mono">{counts.again}</span>
            </button>

            <button
              onClick={() => setSelectedMode('hard')}
              className={`w-full flex items-center justify-between p-4 rounded-md border transition-all duration-200 ${
                selectedMode === 'hard' 
                  ? 'bg-slate-800/80 border-orange-500/50 text-orange-400' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-sans font-medium">Hard Focus</span>
                <span className="text-[10px] font-mono uppercase opacity-70">Difficulty 6.0 - 7.9</span>
              </div>
              <span className="text-lg font-mono">{counts.hard}</span>
            </button>

            <button
              onClick={() => setSelectedMode('good')}
              className={`w-full flex items-center justify-between p-4 rounded-md border transition-all duration-200 ${
                selectedMode === 'good' 
                  ? 'bg-slate-800/80 border-cyan-500/50 text-cyan-400' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-sans font-medium">Good Review</span>
                <span className="text-[10px] font-mono uppercase opacity-70">Difficulty 3.1 - 5.9</span>
              </div>
              <span className="text-lg font-mono">{counts.good}</span>
            </button>

            <button
              onClick={() => setSelectedMode('easy')}
              className={`w-full flex items-center justify-between p-4 rounded-md border transition-all duration-200 ${
                selectedMode === 'easy' 
                  ? 'bg-slate-800/80 border-emerald-500/50 text-emerald-400' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-sans font-medium">Easy Review</span>
                <span className="text-[10px] font-mono uppercase opacity-70">Difficulty &le; 3.0</span>
              </div>
              <span className="text-lg font-mono">{counts.easy}</span>
            </button>
          </div>

          <button
            onClick={startSession}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-200 uppercase text-sm font-sans py-4 rounded-md tracking-widest active:scale-95"
          >
            <Play className="w-4 h-4" />
            Initialize Session
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 font-sans text-cyan-500/70 animate-pulse tracking-widest text-sm">Loading Review...</div>;
  }

  if (testSentences.length === 0) {
    if (sessionStats.totalInitial > 0) {
      // Show Session Completion Summary
      const retentionRate = Math.round((sessionStats.firstTryCorrect / sessionStats.totalInitial) * 100);
      
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-900/80 glass-panel border border-slate-800 p-8 rounded-lg inline-block w-full max-w-md">
            <Activity className="w-12 h-12 text-emerald-500/50 mb-4 mx-auto" />
            <h2 className="text-xl font-sans font-medium text-slate-200 tracking-wide mb-6">Session Complete</h2>
            
            <div className="space-y-4 mb-8 text-left bg-slate-800/30 p-4 rounded-md border border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-sans text-slate-400">Unique Cards Reviewed:</span>
                <span className="font-mono text-cyan-400">{sessionStats.totalInitial}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-sans text-slate-400">First-Try Retention:</span>
                <span className="font-mono text-emerald-400">{retentionRate}%</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setSessionStarted(false)} 
                className="bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all duration-200 uppercase text-xs font-sans py-3 px-6 rounded-md tracking-widest active:scale-95"
              >
                New Session
              </button>
              <button 
                onClick={() => navigate('/stats')} 
                className="bg-transparent border border-cyan-800 text-cyan-500 hover:bg-cyan-900/20 transition-all duration-200 uppercase text-xs font-sans py-3 px-6 rounded-md tracking-widest active:scale-95"
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
        <div className="bg-slate-900/80 glass-panel border border-slate-800 p-8 rounded-lg inline-block max-w-md">
          <Cpu className="w-12 h-12 text-cyan-500/50 mb-4 mx-auto" />
          <h2 className="text-xl font-sans font-medium text-slate-200 tracking-wide">Queue Empty</h2>
          
          <p className="font-sans text-slate-400 mt-4 text-sm">
            {selectedMode === 'all' 
              ? "All due reviews for today are completed." 
              : `No cards currently match the "${selectedMode}" difficulty threshold.`}
          </p>

          {selectedMode !== 'all' && (
            <p className="font-sans text-slate-500 mt-4 text-xs italic">
              Cards naturally filter into Hard and Easy categories as you review them in Standard mode. Keep studying!
            </p>
          )}
          
          <button 
            onClick={() => setSessionStarted(false)} 
            className="mt-8 mx-auto bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all duration-200 uppercase text-xs font-sans py-2 px-6 rounded-md tracking-widest active:scale-95"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  const againCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) >= 8).length;
  const hardCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) >= 6 && (s.fsrs_difficulty || 5.0) < 8).length;
  const goodCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) > 3 && (s.fsrs_difficulty || 5.0) < 6).length;
  const easyCount = testSentences.filter(s => (s.fsrs_difficulty || 5.0) <= 3).length;

  return (
    <div className="max-w-2xl mx-auto py-8 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-6 text-cyan-400/80">
        <Cpu className="w-5 h-5" />
        <h1 className="text-sm font-sans tracking-widest uppercase">Review: {selectedMode}</h1>
      </div>

      {/* Main Terminal Card */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-8 relative overflow-hidden transition-all duration-200">
        
        {/* HUD: Status Bar */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 border-b border-slate-800/80 pb-4">
          <div className="text-xs font-sans text-slate-400">
            Queue: <span className="font-mono text-slate-300 ml-1">{testSentences.length}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans text-slate-500 uppercase tracking-widest hidden md:inline">Complexity:</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-sans text-slate-400 bg-slate-800/30 border border-rose-500/20 px-2 py-0.5 rounded-sm">
                Again: {againCount}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-sans text-slate-400 bg-slate-800/30 border border-orange-500/20 px-2 py-0.5 rounded-sm">
                Hard: {hardCount}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-sans text-slate-400 bg-slate-800/30 border border-cyan-500/20 px-2 py-0.5 rounded-sm">
                Good: {goodCount}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-sans text-slate-400 bg-slate-800/30 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                Easy: {easyCount}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-10">
          
          {/* Target English */}
          <div className="space-y-3 w-full">
            <p className="text-[10px] text-slate-500 uppercase font-sans tracking-widest">English</p>
            <p className="text-2xl font-sans text-slate-200 font-medium tracking-tight leading-snug">
              {currentSentence.english}
            </p>
          </div>

          {/* Decrypted German */}
          <div className="w-full pt-6 space-y-6 min-h-[160px] flex flex-col justify-center">
            {isRevealed ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <audio src={`/audio/${currentSentence.audio}`} autoPlay className="hidden" />
                
                <p className="text-[10px] text-slate-500 uppercase font-sans tracking-widest">German</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                  <p className="text-3xl font-sans text-slate-200 tracking-tight">
                    {currentSentence.german}
                  </p>
                  <button
                    onClick={(e) => playAudio(currentSentence.audio, e)}
                    className="p-2 rounded-full border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all duration-200 active:scale-95"
                    title="Play Audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                {/* Grammar / Source Info */}
                <p className="text-xs font-sans text-slate-500 mt-2">
                  Focus: <span className="text-slate-400">{currentSentence.source_word_de}</span>
                </p>
              </div>
            ) : (
              <button
                onClick={() => setIsRevealed(true)}
                className="mx-auto bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-200 uppercase text-sm font-sans py-3 px-8 rounded-md tracking-widest active:scale-95"
              >
                Show Answer
              </button>
            )}
          </div>
        </div>

        {/* FSRS Control Grid */}
        {isRevealed && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 pt-6 border-t border-slate-800/80 animate-in slide-in-from-bottom-2 duration-200">
            <button onClick={() => handleGrade('again')} className="border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-200 uppercase text-xs font-sans py-3 px-2 rounded-md tracking-widest active:scale-95">AGAIN</button>
            <button onClick={() => handleGrade('hard')} className="border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-200 uppercase text-xs font-sans py-3 px-2 rounded-md tracking-widest active:scale-95">HARD</button>
            <button onClick={() => handleGrade('good')} className="border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-200 uppercase text-xs font-sans py-3 px-2 rounded-md tracking-widest active:scale-95">GOOD</button>
            <button onClick={() => handleGrade('easy')} className="border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-200 uppercase text-xs font-sans py-3 px-2 rounded-md tracking-widest active:scale-95">EASY</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestView;
