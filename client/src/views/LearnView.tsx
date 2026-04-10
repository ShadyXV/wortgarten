import React, { useState } from 'react';
import type { Sentence } from '../types';
import AudioButton from '../components/AudioButton';
import { markAsLearning } from '../api';

interface LearnViewProps {
  sentences: Sentence[];
  setSentences: React.Dispatch<React.SetStateAction<Sentence[]>>;
  onRefresh: () => void;
  loading: boolean;
}

const LearnView: React.FC<LearnViewProps> = ({ sentences, setSentences, onRefresh, loading }) => {
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  const toggleReveal = (id: number) => {
    const next = new Set(revealedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedIds(next);
  };

  const handleAddToTest = async (id: number) => {
    try {
      await markAsLearning(id);
      // Optimistically remove from view
      setSentences(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to add to test', error);
      alert('Failed to add to test deck. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4 flex flex-col items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">New Sentences</h2>
          <p className="text-gray-500">Learn these {sentences.length} sentences before adding them to your test deck.</p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          {loading ? 'Fetching...' : 'Fetch New Batch'}
        </button>
      </div>

      <div className="grid gap-4">
        {sentences.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 italic">No sentences loaded or you've learned them all.</p>
            <button onClick={onRefresh} className="mt-4 text-indigo-600 font-medium hover:underline">
              Fetch a new batch
            </button>
          </div>
        ) : (
          sentences.map((sentence) => (
            <div key={sentence.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <AudioButton filename={sentence.audio} />
                  <p className="text-lg font-medium text-gray-900">{sentence.english}</p>
                </div>
                
                {revealedIds.has(sentence.id) ? (
                  <p className="text-xl font-bold text-indigo-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    {sentence.german}
                  </p>
                ) : (
                  <div className="h-7 w-48 bg-gray-100 rounded animate-pulse" />
                )}
                
                <p className="text-xs text-gray-400">Focus word: <span className="font-semibold">{sentence.source_word_de}</span></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleReveal(sentence.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    revealedIds.has(sentence.id)
                      ? 'bg-gray-100 text-gray-700 border-gray-300'
                      : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {revealedIds.has(sentence.id) ? 'Hide Translation' : 'Show Translation'}
                </button>
                <button
                  onClick={() => handleAddToTest(sentence.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all"
                >
                  Add to Test
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearnView;
