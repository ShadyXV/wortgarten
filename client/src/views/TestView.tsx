import React, { useState, useEffect } from 'react';
import type { Sentence } from '../types';
import AudioButton from '../components/AudioButton';
import { fetchDueTest, submitReview } from '../api';

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
    const numericRating = ratingMap[grade];

    try {
      // Submit the review asynchronously
      await submitReview(currentSentence.id, numericRating);
      
      // Optimistically remove the card from local state
      setTestSentences(prev => prev.slice(1));
      
      // Reset reveal state for the next card immediately
      setIsRevealed(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to save review. Please check your connection.');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading your review deck...</div>;
  }

  if (testSentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-indigo-100 p-6 rounded-full mb-6">
          <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">You're all caught up!</h2>
        <p className="text-gray-500 mt-2">No sentences are currently due for review.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="bg-indigo-600 px-8 py-4 flex justify-between items-center text-white">
          <span className="text-sm font-medium">Review Session</span>
          <span className="text-sm opacity-80">{testSentences.length} Due</span>
        </div>
        
        <div className="p-12 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">English</p>
            <p className="text-3xl font-semibold text-gray-900">{currentSentence.english}</p>
          </div>

          <div className="w-full border-t border-gray-100 pt-8 space-y-4 min-h-[160px] flex flex-col justify-center">
            {isRevealed ? (
              <div className="space-y-6">
                {/* Audio auto-plays when German is revealed */}
                <audio src={`/audio/${currentSentence.audio}`} autoPlay className="hidden" />
                
                <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">German</p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-4xl font-bold text-indigo-600">{currentSentence.german}</p>
                  <AudioButton filename={currentSentence.audio} />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsRevealed(true)}
                className="mx-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Reveal German
              </button>
            )}
          </div>
        </div>

        {isRevealed && (
          <div className="grid grid-cols-4 gap-px bg-gray-200 border-t border-gray-200">
            <button onClick={() => handleGrade('again')} className="bg-white py-6 hover:bg-red-50 text-red-600 font-bold transition-colors">Again</button>
            <button onClick={() => handleGrade('hard')} className="bg-white py-6 hover:bg-orange-50 text-orange-600 font-bold transition-colors">Hard</button>
            <button onClick={() => handleGrade('good')} className="bg-white py-6 hover:bg-green-50 text-green-600 font-bold transition-colors">Good</button>
            <button onClick={() => handleGrade('easy')} className="bg-white py-6 hover:bg-blue-50 text-blue-600 font-bold transition-colors">Easy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestView;
