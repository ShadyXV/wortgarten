import React, { useState } from "react";
import type { Sentence } from "../types";
import AudioButton from "../components/AudioButton";
import { markAsLearning } from "../api";
import { Terminal } from "lucide-react";

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
      alert("SYS.ERR: CONNECTION TO DATABASE SEVERED.");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto transition-all duration-200">
      <div className="text-center py-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 text-cyan-400/80 mb-2">
          <Terminal className="w-5 h-5" />
          <h1 className="text-sm font-sans tracking-widest uppercase">
            Learning
          </h1>
        </div>

        <p className="font-sans text-slate-400 text-sm tracking-tight">
          <span className="text-cyan-400 font-mono">{sentences.length}</span>{" "}
          sentences ready to study.
        </p>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="mt-2 bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 uppercase text-xs font-sans py-2 px-6 rounded-md flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-[0_0_10px_rgba(34,211,238,0.05)]"
        >
          {loading ? "Loading..." : "Refresh List"}
        </button>
      </div>

      <div className="grid gap-6">
        {sentences.length === 0 ? (
          <div className="bg-slate-900/80 glass-panel border border-slate-800 p-8 rounded-lg text-center backdrop-blur-sm">
            <span className="text-[10px] text-slate-500 font-mono uppercase">
              SYS.STATUS.EMPTY
            </span>
            <p className="font-sans font-medium text-slate-200 text-lg mt-4 tracking-wide">
              No New Files in Queue
            </p>
            <p className="font-mono text-slate-500 text-xs mt-2 uppercase">
              Request a new batch from the mainframe.
            </p>
          </div>
        ) : (
          sentences.map((sentence) => (
            <div
              key={sentence.id}
              className="bg-slate-900/80 glass-panel border border-slate-800 p-6 rounded-lg relative overflow-hidden backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200 hover:border-slate-700"
            >
              {/* Header Info */}
              <span className="text-[10px] text-slate-500 absolute top-3 right-4 font-mono uppercase">
                SYS.DATA.FILE_{sentence.id.toString().padStart(4, "0")}
              </span>

              <div className="flex-1 space-y-4 mt-4 md:mt-0">
                {/* English */}
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AudioButton filename={sentence.audio} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-sans tracking-widest mb-1">
                      English
                    </p>
                    <p className="text-xl font-sans text-slate-200 font-medium tracking-tight">
                      {sentence.english}
                    </p>
                  </div>
                </div>

                {/* German */}
                <div className="pl-[52px]">
                  <p className="text-[10px] text-slate-500 uppercase font-sans tracking-widest mb-1">
                    German
                  </p>
                  {revealedIds.has(sentence.id) ? (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-2xl font-sans text-cyan-400 tracking-tight shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                        {sentence.german}
                      </p>
                      <p className="text-xs font-sans text-slate-500 mt-2">
                        Focus:{" "}
                        <span className="text-slate-400 font-sans">
                          {sentence.source_word_de}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="h-8 w-48 bg-slate-800/50 border border-slate-700/50 rounded flex items-center px-3 mt-1">
                      <span className="text-[10px] text-slate-500 font-sans tracking-widest uppercase">
                        Hidden...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-3 min-w-[160px]">
                <button
                  onClick={() => toggleReveal(sentence.id)}
                  className={`border transition-all duration-200 uppercase text-xs font-sans py-2 px-4 rounded-md tracking-widest active:scale-95 ${
                    revealedIds.has(sentence.id)
                      ? "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                      : "bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.05)]"
                  }`}
                >
                  {revealedIds.has(sentence.id) ? "Hide Answer" : "Show Answer"}
                </button>
                <button
                  onClick={() => handleAddToTest(sentence.id)}
                  className="bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 uppercase text-xs font-sans py-2 px-4 rounded-md tracking-widest active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                >
                  Add to Review
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
