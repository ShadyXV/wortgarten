import React, { useState, useEffect } from 'react';
import { Pencil, Save, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { updateSentence } from '../api';

interface EditSentenceModalProps {
  id: number;
  initialEnglish: string;
  initialGerman: string;
  initialDifficulty?: number;
  initialIsLearning?: number;
  onUpdate: (id: number, newEnglish: string, newGerman: string, newDifficulty?: number, newIsLearning?: number) => void;
}

const EditSentenceModal: React.FC<EditSentenceModalProps> = ({
  id,
  initialEnglish,
  initialGerman,
  initialDifficulty,
  initialIsLearning,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [english, setEnglish] = useState(initialEnglish);
  const [german, setGerman] = useState(initialGerman);
  const [difficulty, setDifficulty] = useState(initialDifficulty ?? 5.0);
  const [isLearning, setIsLearning] = useState(initialIsLearning ?? 0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if props change when modal is closed
  useEffect(() => {
    if (!open) {
      setEnglish(initialEnglish);
      setGerman(initialGerman);
      setDifficulty(initialDifficulty ?? 5.0);
      setIsLearning(initialIsLearning ?? 0);
    }
  }, [initialEnglish, initialGerman, initialDifficulty, initialIsLearning, open]);

  const handleSave = async () => {
    if (!english.trim() || !german.trim()) {
      setError("Both fields are required.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await updateSentence(id, { 
        english, 
        german,
        fsrs_difficulty: difficulty,
        is_learning: isLearning
      });
      onUpdate(id, english, german, difficulty, isLearning);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 3) return 'Easy';
    if (diff <= 5) return 'Good';
    if (diff <= 7) return 'Hard';
    return 'Again (Very Hard)';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setEnglish(initialEnglish);
        setGerman(initialGerman);
        setDifficulty(initialDifficulty ?? 5.0);
        setIsLearning(initialIsLearning ?? 0);
        setError(null);
      }
    }}>
      <DialogTrigger asChild>
        <button
          className="bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-all duration-200 py-2 px-3 rounded-md active:scale-95 shadow-[0_0_10px_rgba(34,211,238,0.02)] flex items-center justify-center"
          title="Edit Sentence"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-cyan-500" />
            Edit System Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-sans tracking-widest text-slate-500 uppercase">German</label>
            <Input
              value={german}
              onChange={(e) => setGerman(e.target.value)}
              placeholder="Enter German translation"
              className="font-sans text-base"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-sans tracking-widest text-slate-500 uppercase">English</label>
            <Input
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="Enter English translation"
              className="font-sans text-base"
            />
          </div>

          {initialDifficulty !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-sans tracking-widest text-slate-500 uppercase">Learning State</label>
                <select
                  value={isLearning}
                  onChange={(e) => setIsLearning(parseInt(e.target.value, 10))}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value={0}>Not Started (Queue)</option>
                  <option value={1}>Active Learning</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans tracking-widest text-slate-500 uppercase">Current Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseFloat(e.target.value))}
                  disabled={isLearning === 0}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                >
                  <option value={2}>Easy (&le; 3)</option>
                  <option value={5}>Good (4 - 5)</option>
                  <option value={7}>Hard (6 - 7)</option>
                  <option value={9}>Again (8+)</option>
                </select>
                {isLearning === 1 && (
                  <p className="text-[10px] text-cyan-500/70 font-mono">Current: {getDifficultyLabel(difficulty)}</p>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-rose-400 font-sans">{error}</p>}
        </div>

        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-sans text-slate-400 hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-cyan-900/30 border border-cyan-800 text-cyan-400 hover:bg-cyan-900/50 transition-all duration-200 uppercase text-xs font-sans py-2 px-6 rounded-md tracking-widest active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Saving...' : 'Save Override'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSentenceModal;