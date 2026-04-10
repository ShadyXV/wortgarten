import React, { useState } from 'react';
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
  onUpdate: (id: number, newEnglish: string, newGerman: string) => void;
}

const EditSentenceModal: React.FC<EditSentenceModalProps> = ({
  id,
  initialEnglish,
  initialGerman,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [english, setEnglish] = useState(initialEnglish);
  const [german, setGerman] = useState(initialGerman);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!english.trim() || !german.trim()) {
      setError("Both fields are required.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await updateSentence(id, { english, german });
      onUpdate(id, english, german);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        // Reset state on close
        setEnglish(initialEnglish);
        setGerman(initialGerman);
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