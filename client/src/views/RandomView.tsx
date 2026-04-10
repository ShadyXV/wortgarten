import React, { useState, useEffect } from 'react';
import type { Sentence } from '../types';
import AudioButton from '../components/AudioButton';

interface RandomViewProps {
  sentences: Sentence[];
}

const RandomView: React.FC<RandomViewProps> = ({ sentences }) => {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const getRandomSentence = () => {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setCurrentSentence(sentences[randomIndex]);
    setIsRevealed(false);
  };

  useEffect(() => {
    if (sentences.length > 0) getRandomSentence();
  }, [sentences]);

  if (!currentSentence) return null;

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
          onClick={getRandomSentence}
          className="mt-4 px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2"
        >
          <span>Next Random</span>
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
