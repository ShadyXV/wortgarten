import React, { useState, useEffect } from 'react';
import type { Sentence } from '../types';
import { fetchDueTest, submitReview } from '../api';
import { Cpu, Volume2 } from 'lucide-react';

const TestView: React.FC = () => {
  const [testSentences, setTestSentences] = useState<Sentence[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueTest()
      .then(setTestSentences)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentSentence = testSentences[0];

  const handleGrade = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentSentence) return;
    const ratingMap = { again: 1, hard: 2, good: 3, easy: 4 } as const;
    try {
      await submitReview(currentSentence.id, ratingMap[grade]);
      setTestSentences(prev => prev.slice(1));
      setIsRevealed(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('SYS.ERR: DATABASE UPDATE FAILED.');
    }
  };

  const playAudio = (filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = new Audio(`/audio/${filename}`);
    audio.play().catch(err => console.error("Audio playback failed", err));
  };

  if (loading) {
    return <div className="text-center py-20 font-mono text-cyan-500/70 animate-pulse tracking-widest text-sm">INITIALIZING REVIEW MODULE...</div>;
  }

  if (testSentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-900/80 glass-panel border border-slate-800 p-8 rounded-lg inline-block">
          <Cpu className="w-12 h-12 text-cyan-500/50 mb-4 mx-auto" />
          <h2 className="text-xl font-sans font-medium text-slate-200 tracking-wide">Queue Empty</h2>
          <p className="font-mono text-slate-500 mt-2 text-xs uppercase">All reviews completed successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8 text-cyan-400/80">
        <Cpu className="w-5 h-5" />
        <h1 className="text-sm font-mono tracking-widest uppercase">Review Protocol</h1>
      </div>

      {/* Main Terminal Card */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-8 glass-panel relative overflow-hidden transition-all duration-200">
        
        {/* Top Meta Info */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-4">
          <span className="text-xs font-mono text-slate-500">PENDING: {testSentences.length}</span>
          <span className="text-xs font-mono text-slate-500">ID_{currentSentence.id.toString().padStart(4, '0')}</span>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-10">
          
          {/* Target English */}
          <div className="space-y-3 w-full">
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Target_EN</p>
            <p className="text-2xl font-sans text-slate-200 font-medium tracking-tight leading-snug">
              {currentSentence.english}
            </p>
          </div>

          {/* Decrypted German */}
          <div className="w-full pt-6 space-y-6 min-h-[160px] flex flex-col justify-center">
            {isRevealed ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <audio src={`/audio/${currentSentence.audio}`} autoPlay className="hidden" />
                
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Decrypted_DE</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                  <p className="text-3xl font-sans text-cyan-400 tracking-tight shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                    {currentSentence.german}
                  </p>
                  <button
                    onClick={(e) => playAudio(currentSentence.audio, e)}
                    className="p-2 rounded-full border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 active:scale-95 shadow-[0_0_10px_rgba(34,211,238,0.05)]"
                    title="Play Audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                {/* Grammar / Source Info */}
                <p className="text-xs font-sans text-slate-500 mt-2">
                  Source: <span className="text-slate-400">{currentSentence.source_word_de}</span>
                </p>
              </div>
            ) : (
              <button
                onClick={() => setIsRevealed(true)}
                className="mx-auto bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 uppercase text-sm font-mono py-3 px-8 rounded-md tracking-widest active:scale-95 shadow-[0_0_10px_rgba(34,211,238,0.05)]"
              >
                Decrypt Data
              </button>
            )}
          </div>
        </div>

        {/* FSRS Control Grid */}
        {isRevealed && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 pt-6 border-t border-slate-800/50 animate-in slide-in-from-bottom-2 duration-200">
            <button onClick={() => handleGrade('again')} className="border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all duration-200 uppercase text-xs font-mono py-3 px-2 rounded-md tracking-widest active:scale-95">AGAIN</button>
            <button onClick={() => handleGrade('hard')} className="border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-all duration-200 uppercase text-xs font-mono py-3 px-2 rounded-md tracking-widest active:scale-95">HARD</button>
            <button onClick={() => handleGrade('good')} className="border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 uppercase text-xs font-mono py-3 px-2 rounded-md tracking-widest active:scale-95">GOOD</button>
            <button onClick={() => handleGrade('easy')} className="border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all duration-200 uppercase text-xs font-mono py-3 px-2 rounded-md tracking-widest active:scale-95">EASY</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestView;
