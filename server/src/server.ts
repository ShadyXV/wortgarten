import express from 'express';
import cors from 'cors';
import db from './db';
import type { SentenceRow } from './types';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// GET /api/learn
// Displays a small batch of new sentences
app.get('/api/learn', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM sentences WHERE is_learning = 0 ORDER BY RANDOM() LIMIT 5');
    const sentences = stmt.all() as SentenceRow[];
    res.json(sentences);
  } catch (error) {
    console.error('Error fetching learn sentences:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/learn/:id
// Marks a sentence as "Added to Test"
app.put('/api/learn/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID parameter' });
      return;
    }

    const stmt = db.prepare('UPDATE sentences SET is_learning = 1, fsrs_state = 0 WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Sentence not found' });
      return;
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error(`Error updating sentence ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/test/due
// Fetches sentences that are due for FSRS review
app.get('/api/test/due', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM sentences WHERE is_learning = 1 AND (fsrs_due <= CURRENT_TIMESTAMP OR fsrs_due IS NULL) ORDER BY fsrs_due ASC LIMIT 20');
    const sentences = stmt.all() as SentenceRow[];
    res.json(sentences);
  } catch (error) {
    console.error('Error fetching due sentences:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function for simplified spaced repetition
function calculateNextReview(currentData: SentenceRow, rating: 1 | 2 | 3 | 4) {
  const now = new Date();
  let stability = currentData.fsrs_stability || 0;
  let difficulty = currentData.fsrs_difficulty || 5; // Unused in this simple version, kept for schema
  let reps = (currentData.fsrs_reps || 0) + 1;
  let lapses = currentData.fsrs_lapses || 0;
  let nextDue = new Date(now);

  if (stability === 0) {
    // New card initialization
    if (rating === 1) stability = 0.1;
    else if (rating === 2) stability = 0.5;
    else if (rating === 3) stability = 1;
    else if (rating === 4) stability = 4;
  } else {
    // Existing card updates
    if (rating === 1) {
      lapses += 1;
      stability = Math.max(0.1, stability * 0.1);
    } else if (rating === 2) {
      stability = stability * 1.2;
    } else if (rating === 3) {
      stability = Math.max(1, stability * 2.5);
    } else if (rating === 4) {
      stability = Math.max(1, stability * 3.5);
    }
  }

  // Calculate next due date
  if (rating === 1) {
    nextDue.setMinutes(now.getMinutes() + 1);
  } else {
    // Convert stability (days) to minutes for precision
    nextDue.setMinutes(now.getMinutes() + Math.round(stability * 24 * 60));
  }

  return {
    fsrs_stability: stability,
    fsrs_difficulty: difficulty,
    fsrs_reps: reps,
    fsrs_lapses: lapses,
    fsrs_due: nextDue.toISOString(),
  };
}

// GET /api/random
// Fetches a single random sentence from the entire pool
app.get('/api/random', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM sentences ORDER BY RANDOM() LIMIT 1');
    const sentence = stmt.get() as SentenceRow | undefined;
    
    if (!sentence) {
      res.status(404).json({ error: 'No sentences found in the database' });
      return;
    }

    res.json(sentence);
  } catch (error) {
    console.error('Error fetching random sentence:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/test/review
// Submit a spaced repetition rating for a sentence
app.post('/api/test/review', (req, res) => {
  try {
    const { id, rating } = req.body;

    if (!id || typeof id !== 'number') {
      res.status(400).json({ error: 'Invalid or missing ID' });
      return;
    }

    if (![1, 2, 3, 4].includes(rating)) {
      res.status(400).json({ error: 'Invalid rating. Must be 1, 2, 3, or 4.' });
      return;
    }

    // Fetch current sentence data
    const getStmt = db.prepare('SELECT * FROM sentences WHERE id = ?');
    const currentData = getStmt.get(id) as SentenceRow | undefined;

    if (!currentData) {
      res.status(404).json({ error: 'Sentence not found' });
      return;
    }

    // Calculate new metrics
    const newMetrics = calculateNextReview(currentData, rating as 1 | 2 | 3 | 4);

    // Update the database
    const updateStmt = db.prepare(`
      UPDATE sentences 
      SET 
        fsrs_due = ?, 
        fsrs_stability = ?, 
        fsrs_difficulty = ?, 
        fsrs_reps = ?, 
        fsrs_lapses = ?, 
        fsrs_last_review = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      newMetrics.fsrs_due,
      newMetrics.fsrs_stability,
      newMetrics.fsrs_difficulty,
      newMetrics.fsrs_reps,
      newMetrics.fsrs_lapses,
      id
    );

    res.json({ success: true, metrics: newMetrics });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
