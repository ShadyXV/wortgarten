import React, { useState, useEffect } from 'react';
import { Database, Search, ChevronLeft, ChevronRight, Loader2, Plus, RefreshCw } from 'lucide-react';
import type { Sentence } from '../types';
import { fetchManageSentences, markAsLearning } from '../api';
import AudioButton from '../components/AudioButton';
import EditSentenceModal from '../components/EditSentenceModal';

const ManageView: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadSentences = async (currentPage: number, query: string) => {
    setLoading(true);
    try {
      const data = await fetchManageSentences(currentPage, query);
      setSentences(data.sentences);
      setTotalPages(data.totalPages);
      setPage(data.page);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Failed to load manage sentences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSentences(page, searchQuery);
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleUpdateSentence = (
    id: number, 
    newEnglish: string, 
    newGerman: string, 
    newDifficulty?: number,
    newIsLearning?: number
  ) => {
    setSentences(prev =>
      prev.map(s =>
        s.id === id 
          ? { 
              ...s, 
              english: newEnglish, 
              german: newGerman, 
              fsrs_difficulty: newDifficulty ?? s.fsrs_difficulty,
              is_learning: newIsLearning ?? s.is_learning
            } 
          : s
      )
    );
  };

  const handleAddToTest = async (id: number) => {
    try {
      await markAsLearning(id);
      setSentences(prev => prev.map(s => s.id === id ? { ...s, is_learning: 1 } : s));
    } catch (error) {
      console.error('Failed to add to review', error);
      alert('SYS.ERR: DATABASE UPDATE FAILED.');
    }
  };

  const getDifficultyBadge = (diff: number) => {
    if (diff <= 3) return <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">EASY</span>;
    if (diff <= 5) return <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">GOOD</span>;
    if (diff <= 7) return <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">HARD</span>;
    return <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">AGAIN</span>;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8 text-cyan-400/80">
        <Database className="w-5 h-5" />
        <h1 className="text-sm font-sans tracking-widest uppercase">Database Management</h1>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-4 glass-panel flex flex-col md:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96 flex">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="flex h-10 w-full rounded-l-md border border-r-0 border-slate-800 bg-slate-950/50 pl-10 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all font-sans"
            placeholder="Search English or German..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="bg-slate-800 text-slate-300 px-4 rounded-r-md border border-slate-700 hover:bg-slate-700 transition-colors text-sm font-sans">
            Search
          </button>
        </form>

        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          TOTAL_RECORDS: <span className="text-cyan-400">{totalItems}</span>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg glass-panel overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-500/70">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="font-sans text-sm tracking-widest uppercase animate-pulse">Querying Database...</span>
          </div>
        ) : sentences.length === 0 ? (
          <div className="text-center py-20 font-sans text-slate-500 text-sm tracking-widest uppercase">
            No records matched your query.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {sentences.map((s) => (
              <div key={s.id} className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                
                {/* Meta & Actions block */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">
                    ID_{s.id.toString().padStart(4, '0')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <AudioButton filename={s.audio} />
                    <EditSentenceModal
                      id={s.id}
                      initialEnglish={s.english}
                      initialGerman={s.german}
                      initialDifficulty={s.fsrs_difficulty || 5.0}
                      initialIsLearning={s.is_learning}
                      onUpdate={handleUpdateSentence}
                    />
                    
                    {s.is_learning === 0 ? (
                      <button
                        onClick={() => handleAddToTest(s.id)}
                        className="bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 py-2 px-3 rounded-md active:scale-95 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.02)]"
                        title="Add to Review Queue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500/50 py-2 px-3 rounded-md cursor-default flex items-center justify-center"
                        title="Already active in learning queue"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Text Data */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <p className="font-sans text-slate-200 text-lg w-full sm:w-1/2">{s.german}</p>
                    <p className="font-sans text-slate-400 text-sm w-full sm:w-1/2">{s.english}</p>
                  </div>
                  <p className="text-xs font-sans text-slate-600">
                    Source: <span className="text-slate-500">{s.source_word_de}</span>
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-row lg:flex-col items-end gap-2 min-w-[100px]">
                  {s.is_learning === 1 ? (
                    <>
                      <span className="text-[10px] text-cyan-400 font-sans tracking-widest uppercase">ACTIVE</span>
                      {getDifficultyBadge(s.fsrs_difficulty || 5.0)}
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-sans tracking-widest uppercase">NOT STARTED</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800/50 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors py-2 px-4 rounded-md text-xs font-sans uppercase tracking-widest disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="text-xs font-mono text-slate-500">
            PAGE <span className="text-cyan-400">{page}</span> OF <span className="text-slate-400">{totalPages}</span>
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors py-2 px-4 rounded-md text-xs font-sans uppercase tracking-widest disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageView;