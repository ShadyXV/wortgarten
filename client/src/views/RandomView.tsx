import React, { useState, useEffect, useCallback } from 'react';
import type { Sentence } from '../types';
import AudioButton from '../components/AudioButton';
import { fetchRandom, submitReview } from '../api';
import { Shuffle } from 'lucide-react';

const RandomView: React.FC = () => {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());

  const loadRandomSentence = useCallback(async () => {
    setLoading(true);
    try {
      const sentence = await fetchRandom();
      setCurrentSentence(sentence);
      setIsRevealed(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load random sentence:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRandomSentence();
  }, [loadRandomSentence]);

  const handleGrade = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentSentence) return;
    const ratingMap = { again: 1, hard: 2, good: 3, easy: 4 } as const;
    const numericRating = ratingMap[grade];
    const timeTakenMs = Date.now() - startTime;

    try {
      // Sync with backend immediately
      submitReview(currentSentence.id, numericRating, timeTakenMs).catch(error => {
        console.error('Failed to submit review sync:', error);
      });
      // Move to the next random sentence automatically
      loadRandomSentence();
    } catch (error) {
      console.error('Grade update failed:', error);
    }
  };

  if (loading && !currentSentence) {
    return <div className="text-center py-20 text-[var(--wg-gold)] animate-pulse tracking-widest text-sm uppercase">Loading...</div>;
  }

  if (!currentSentence) {
    return <div className="text-center py-20 text-[var(--wg-coral)] tracking-widest text-sm uppercase">Error: Database empty or unavailable.</div>;
  }

  return (
    <div className="wg-page max-w-2xl py-8 transition-all duration-200">
      <div className="wg-page-header mb-8">
        <div className="wg-kicker">
          <Shuffle className="w-5 h-5" />
          <h1>Practice</h1>
        </div>
      </div>

      <div className="wg-panel wg-flashcard p-8 relative overflow-hidden transition-all duration-200 flex flex-col items-center text-center">
        <span className="wg-badge absolute top-4 right-6">
          Sentence ID: {currentSentence.id}
        </span>

        <div className="space-y-4 w-full py-6 mt-4">
          <p className="wg-label border-b border-[rgba(212,175,55,0.14)] pb-2">English</p>
          <p className="text-2xl text-[var(--wg-ivory)] font-medium tracking-tight">
            {currentSentence.english}
          </p>
        </div>

        <div className="min-h-[160px] flex flex-col justify-center w-full mt-2">
          {isRevealed ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <audio src={`/audio/${currentSentence.audio}`} autoPlay className="hidden" />
              
              <p className="wg-label border-b border-[rgba(212,175,55,0.14)] pb-2">German</p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                <p className="wg-german text-4xl text-[var(--wg-gold)] tracking-tight">
                  {currentSentence.german}
                </p>
                <AudioButton filename={currentSentence.audio} />
              </div>
              
              <p className="text-xs wg-subtle pt-4">
                Focus: <span className="text-[var(--wg-linden)]">{currentSentence.source_word_de}</span>
              </p>
            </div>
          ) : (
            <button
              onClick={() => setIsRevealed(true)}
              className="wg-btn wg-btn-secondary mx-auto py-3 px-8"
            >
              Show Answer
            </button>
          )}
        </div>

        {isRevealed && (
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 pt-6 border-t border-[rgba(212,175,55,0.14)] animate-in slide-in-from-bottom-2 duration-200">
            <button onClick={() => handleGrade('again')} className="wg-btn wg-btn-danger">Again</button>
            <button onClick={() => handleGrade('hard')} className="wg-btn wg-btn-secondary">Hard</button>
            <button onClick={() => handleGrade('good')} className="wg-btn wg-btn-success">Good</button>
            <button onClick={() => handleGrade('easy')} className="wg-btn">Easy</button>
          </div>
        )}

        <div className="w-full mt-6 flex justify-center">
          <button
            onClick={loadRandomSentence}
            disabled={loading}
            className="wg-btn wg-btn-ghost text-[10px] disabled:opacity-50"
          >
            <Shuffle className="w-3 h-3" />
            {loading ? 'Loading...' : 'Skip / Next Random'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomView;
