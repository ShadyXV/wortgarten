import React, { useState } from 'react';
import type { Sentence } from '../types';
import AudioButton from '../components/AudioButton';

interface LearnViewProps {
  sentences: Sentence[];
  addToTest: (id: number) => void;
}

const LearnView: React.FC<LearnViewProps> = ({ sentences, addToTest }) => {
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  
  // Show only 5 new sentences at a time
  const newSentences = sentences
    .filter(s => !s.is_learning)
    .slice(0, 5);

  const toggleReveal = (id: number) => {
    const next = new Set(revealedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedIds(next);
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-800">New Sentences</h2>
        <p className="text-gray-500">Learn these {newSentences.length} sentences before adding them to your test deck.</p>
      </div>

      <div className="grid gap-4">
        {newSentences.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 italic">All caught up! No more new sentences for now.</p>
          </div>
        ) : (
          newSentences.map((sentence) => (
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
                  onClick={() => addToTest(sentence.id)}
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
