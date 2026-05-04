import React, { useState, useEffect } from 'react';
import { Pencil, Save, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
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
    if (diff <= 3.0) return 'Easy';
    if (diff <= 5.0) return 'Good';
    if (diff <= 7.0) return 'Hard';
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
          className="wg-icon-btn"
          title="Edit Sentence"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[var(--wg-gold)]" />
            Edit Wortkarte
          </DialogTitle>
          <DialogDescription>
            Update the German and English text for this vocabulary card.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="wg-label">German</label>
            <Input
              value={german}
              onChange={(e) => setGerman(e.target.value)}
              placeholder="Enter German translation"
              className="wg-german text-base"
            />
          </div>
          
          <div className="space-y-2">
            <label className="wg-label">English</label>
            <Input
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="Enter English translation"
              className="text-base"
            />
          </div>

          {initialDifficulty !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="wg-label">Learning State</label>
                <select
                  value={isLearning}
                  onChange={(e) => setIsLearning(parseInt(e.target.value, 10))}
                  className="wg-select"
                >
                  <option value={0}>Not Started (Queue)</option>
                  <option value={1}>Active Learning</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="wg-label">Current Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseFloat(e.target.value))}
                  disabled={isLearning === 0}
                  className="wg-select disabled:opacity-50"
                >
                  <option value={2.0}>Easy (&le; 3.0)</option>
                  <option value={4.0}>Good (3.1 - 5.0)</option>
                  <option value={6.5}>Hard (5.1 - 7.0)</option>
                  <option value={9.0}>Again (&gt; 7.0)</option>
                </select>
                {isLearning === 1 && (
                  <p className="text-[10px] text-[var(--wg-linden)] wg-tabular">Current: {getDifficultyLabel(difficulty)}</p>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-[var(--wg-coral)]">{error}</p>}
        </div>

        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="wg-btn wg-btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="wg-btn wg-btn-primary disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Saving...' : 'Save Card'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSentenceModal;
