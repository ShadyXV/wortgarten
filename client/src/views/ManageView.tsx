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
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const loadSentences = async (currentPage: number, query: string, diff: string) => {
    setLoading(true);
    try {
      const data = await fetchManageSentences(currentPage, query, diff);
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
    loadSentences(page, searchQuery, difficultyFilter);
  }, [page, searchQuery, difficultyFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficultyFilter(e.target.value);
    setPage(1);
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
      alert('Could not update this card. Please try again.');
    }
  };

  const getDifficultyBadge = (diff: number) => {
    if (diff <= 3.0) return <span className="wg-badge wg-badge-easy">Easy</span>;
    if (diff <= 5.0) return <span className="wg-badge wg-badge-good">Good</span>;
    if (diff <= 7.0) return <span className="wg-badge wg-badge-hard">Hard</span>;
    return <span className="wg-badge wg-badge-again">Again</span>;
  };

  return (
    <div className="wg-page-wide py-8 space-y-6 transition-all duration-200">
      <div className="wg-page-header mb-8">
        <div className="wg-kicker">
          <Database className="w-5 h-5" />
          <h1>Datenbank verwalten</h1>
        </div>
      </div>

      <div className="wg-panel p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="wg-search-form relative w-full md:w-[480px] flex">
            <input
              type="text"
              className="wg-input wg-input-inline wg-search-input"
              placeholder="Search English or German..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="wg-btn wg-search-submit rounded-l-none" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="wg-select-wrap md:w-44">
            <select
              value={difficultyFilter}
              onChange={handleDifficultyChange}
              className="wg-select wg-select-native cursor-pointer"
            >
              <option value="all">All Labels</option>
              <option value="easy">Easy</option>
              <option value="good">Good</option>
              <option value="hard">Hard</option>
              <option value="again">Again</option>
            </select>
          </div>
        </div>

        <div className="wg-badge wg-tabular">
          Total Records: <span className="text-[var(--wg-gold)]">{totalItems}</span>
        </div>
      </div>

      <div className="wg-panel overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--wg-gold)]">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="text-sm tracking-widest uppercase animate-pulse">Querying Database...</span>
          </div>
        ) : sentences.length === 0 ? (
          <div className="text-center py-20 wg-subtle text-sm tracking-widest uppercase">
            No records matched your query.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(212,175,55,0.12)]">
            {sentences.map((s) => (
              <div key={s.id} className="wg-row p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <span className="wg-label wg-tabular">
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
                        className="wg-icon-btn text-[var(--wg-linden)]"
                        title="Add to Review Queue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        className="wg-icon-btn cursor-default text-[var(--wg-linden)] opacity-60"
                        title="Already active in learning queue"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <p className="wg-german text-[var(--wg-ivory)] text-lg w-full sm:w-1/2">{s.german}</p>
                    <p className="wg-subtle text-sm w-full sm:w-1/2">{s.english}</p>
                  </div>
                  <p className="text-xs text-[rgba(235,227,214,0.34)]">
                    Source: <span className="text-[rgba(127,183,117,0.76)]">{s.source_word_de}</span>
                  </p>
                </div>

                <div className="flex flex-row lg:flex-col items-end gap-2 min-w-[100px]">
                  {s.is_learning === 1 ? (
                    <>
                      <span className="wg-badge wg-badge-good">Active</span>
                      {getDifficultyBadge(s.fsrs_difficulty || 5.0)}
                    </>
                  ) : (
                    <span className="wg-badge">Not Started</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[rgba(212,175,55,0.14)] pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="wg-btn disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="wg-badge wg-tabular">
            Page <span className="text-[var(--wg-gold)]">{page}</span> of <span>{totalPages}</span>
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="wg-btn disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageView;
