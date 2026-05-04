import React, { useState } from "react";
import type { Sentence } from "../types";
import AudioButton from "../components/AudioButton";
import EditSentenceModal from "../components/EditSentenceModal";
import { markAsLearning } from "../api";
import { BookOpen, RefreshCw, Sprout } from "lucide-react";

interface LearnViewProps {
  sentences: Sentence[];
  setSentences: React.Dispatch<React.SetStateAction<Sentence[]>>;
  onRefresh: () => void;
  loading: boolean;
}

const LearnView: React.FC<LearnViewProps> = ({
  sentences,
  setSentences,
  onRefresh,
  loading,
}) => {
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
      setSentences((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to add to test", error);
      alert("Could not add this card to review. Please try again.");
    }
  };

  const handleUpdateSentence = (
    id: number,
    newEnglish: string,
    newGerman: string,
  ) => {
    setSentences((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, english: newEnglish, german: newGerman } : s,
      ),
    );
  };

  return (
    <div className="wg-page space-y-7 transition-all duration-200">
      <div className="wg-page-header">
        <div className="wg-kicker">
          <BookOpen className="w-4 h-4" />
          <h1>Lernen</h1>
        </div>

        <p className="wg-subtle text-sm tracking-tight">
          <span className="wg-count">{sentences.length}</span>{" "}
          sentences ready to study.
        </p>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="wg-btn wg-btn-secondary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh List"}
        </button>
      </div>

      <div className="grid gap-6">
        {sentences.length === 0 ? (
          <div className="wg-panel p-8 text-center">
            <span className="wg-badge">
              Queue Empty
            </span>
            <p className="wg-serif font-medium text-[var(--wg-ivory)] text-2xl mt-4 tracking-wide">
              No New Cards in the Garden
            </p>
            <p className="wg-subtle text-xs mt-2 uppercase tracking-[0.16em]">
              Refresh when you are ready for another batch.
            </p>
          </div>
        ) : (
          sentences.map((sentence) => (
            <div
              key={sentence.id}
              className="wg-panel wg-row p-6 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AudioButton filename={sentence.audio} />
                  </div>
                  <div>
                    <p className="wg-label mb-1">
                      English
                    </p>
                    <p className="text-xl text-[var(--wg-ivory)] font-medium tracking-tight">
                      {sentence.english}
                    </p>
                  </div>
                </div>

                <div className="pl-[52px]">
                  <p className="wg-label mb-1">
                    German
                  </p>
                  {revealedIds.has(sentence.id) ? (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="wg-german text-3xl tracking-tight text-[var(--wg-gold)]">
                        {sentence.german}
                      </p>
                      <p className="text-xs wg-subtle mt-2">
                        Focus:{" "}
                        <span className="text-[var(--wg-linden)]">
                          {sentence.source_word_de}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="h-8 w-48 border border-[rgba(212,175,55,0.18)] bg-[rgba(8,15,21,0.38)] rounded-[7px] flex items-center px-3 mt-1">
                      <span className="text-[10px] text-[rgba(235,227,214,0.34)] tracking-widest uppercase">
                        Hidden...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[160px] md:self-start">
                <div className="flex justify-end">
                  <EditSentenceModal
                    id={sentence.id}
                    initialEnglish={sentence.english}
                    initialGerman={sentence.german}
                    onUpdate={handleUpdateSentence}
                  />
                </div>
                <button
                  onClick={() => toggleReveal(sentence.id)}
                  className={`wg-btn ${
                    revealedIds.has(sentence.id)
                      ? "wg-btn-ghost"
                      : "wg-btn-secondary"
                  }`}
                >
                  {revealedIds.has(sentence.id) ? "Hide Answer" : "Show Answer"}
                </button>
                <button
                  onClick={() => handleAddToTest(sentence.id)}
                  className="wg-btn wg-btn-success"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  Add for Review
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
