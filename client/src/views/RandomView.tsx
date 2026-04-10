import React, { useState, useEffect, useCallback } from 'react';
import type { Sentence } from '../types';
import AudioButton from '../components/AudioButton';
import { fetchRandom } from '../api';
import { Shuffle } from 'lucide-react';

const RandomView: React.FC = () => {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRandomSentence = useCallback(async () => {
    setLoading(true);
    try {
      const sentence = await fetchRandom();
      setCurrentSentence(sentence);
      setIsRevealed(false);
    } catch (error) {
      console.error('Failed to load random sentence:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRandomSentence();
  }, [loadRandomSentence]);

  if (loading && !currentSentence) {
    return <div className="text-center py-20 font-mono text-cyan-500/70 animate-pulse tracking-widest text-sm">ACCESSING MAINFRAME...</div>;
  }

  if (!currentSentence) {
    return <div className="text-center py-20 font-mono text-rose-500/80 tracking-widest text-sm">ERR: DATABASE EMPTY OR CORRUPTED.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 transition-all duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8 text-cyan-400/80">
        <Shuffle className="w-5 h-5" />
        <h1 className="text-sm font-mono tracking-widest uppercase">Sandbox Override</h1>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-8 glass-panel relative overflow-hidden transition-all duration-200 flex flex-col items-center text-center">
        
        {/* Top Meta Info */}
        <span className="text-[10px] font-mono text-slate-500 absolute top-4 right-6 uppercase">
          SYS.ID_{currentSentence.id.toString().padStart(4, '0')} // RANDOM_SEED
        </span>

        {/* Target English */}
        <div className="space-y-4 w-full py-6 mt-4">
          <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest border-b border-slate-800/50 pb-2">Query_EN</p>
          <p className="text-2xl font-sans text-slate-200 font-medium tracking-tight">
            {currentSentence.english}
          </p>
        </div>

        {/* Decrypted German */}
        <div className="min-h-[160px] flex flex-col justify-center w-full mt-2">
          {isRevealed ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <audio src={`/audio/${currentSentence.audio}`} autoPlay className="hidden" />
              
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest border-b border-slate-800/50 pb-2">Result_DE</p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                <p className="text-3xl font-sans text-cyan-400 tracking-tight shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                  {currentSentence.german}
                </p>
                <AudioButton filename={currentSentence.audio} />
              </div>
              
              <p className="text-xs font-sans text-slate-500 pt-4">
                Index: <span className="text-slate-400 font-mono">{currentSentence.source_word_de}</span>
              </p>
            </div>
          ) : (
            <button
              onClick={() => setIsRevealed(true)}
              className="mx-auto bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 uppercase text-sm font-mono py-3 px-8 rounded-md tracking-widest active:scale-95 shadow-[0_0_10px_rgba(34,211,238,0.05)]"
            >
              Execute Query
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="w-full border-t border-slate-800/50 mt-10 pt-6 flex justify-center">
          <button
            onClick={loadRandomSentence}
            disabled={loading}
            className="bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-all duration-200 uppercase text-xs font-mono py-2 px-6 rounded-md tracking-widest disabled:opacity-50 active:scale-95 flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            {loading ? 'Processing...' : 'Next Random Node'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomView;
