import React, { useState, useEffect, useCallback } from 'react';
import type { Sentence } from '../types';
import AudioButton from '../components/AudioButton';
import { fetchRandom } from '../api';

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
    return <div className="text-center py-20 text-gray-500">Loading a random sentence...</div>;
  }

  if (!currentSentence) {
    return <div className="text-center py-20 text-gray-500">No sentences found in the database.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Random Practice</h2>
        <p className="text-gray-500">A sandbox to practice any sentence from the database.</p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-mono uppercase">
          ID: {currentSentence.id}
        </div>

        <div className="space-y-4">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-black">Question</p>
          <p className="text-2xl font-medium text-gray-700">{currentSentence.english}</p>
        </div>

        <div className="w-full h-px bg-gray-100" />

        <div className="min-h-[120px] flex flex-col justify-center w-full">
          {isRevealed ? (
            <div className="space-y-6">
              {/* Auto-play the audio upon revealing */}
              <audio src={`/audio/${currentSentence.audio}`} autoPlay className="hidden" />
              
               <div className="flex items-center justify-center gap-4">
                  <p className="text-4xl font-black text-gray-900 leading-tight">
                    {currentSentence.german}
                  </p>
                  <AudioButton filename={currentSentence.audio} />
                </div>
                <p className="text-indigo-600 font-medium">Source: {currentSentence.source_word_de}</p>
            </div>
          ) : (
            <button
              onClick={() => setIsRevealed(true)}
              className="mx-auto text-indigo-600 font-bold hover:underline"
            >
              Show Answer
            </button>
          )}
        </div>

        <button
          onClick={loadRandomSentence}
          disabled={loading}
          className="mt-4 px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
        >
          <span>{loading ? 'Loading...' : 'Next Random'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RandomView;
