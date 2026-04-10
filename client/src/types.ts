export interface Sentence {
  id: number;
  german: string;
  english: string;
  audio: string;
  source_word_de: string;
  is_learning: boolean;
  // FSRS Fields
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  last_review: string;
  state: number;
}

export type View = 'learn' | 'test' | 'random';
