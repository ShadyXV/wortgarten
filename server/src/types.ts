export interface SentenceRow {
  id: number;
  german: string;
  english: string;
  audio: string;
  source_word_de: string;
  source_word_en?: string;
  grammar_note?: string;
  is_learning: number; // 0 or 1
  fsrs_state: number;
  fsrs_due: string; // ISO DATETIME
  fsrs_stability: number;
  fsrs_difficulty: number;
  fsrs_elapsed_days: number;
  fsrs_scheduled_days: number;
  fsrs_reps: number;
  fsrs_lapses: number;
  fsrs_last_review: string | null; // ISO DATETIME
  created_at: string;
}
