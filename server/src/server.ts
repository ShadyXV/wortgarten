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

// PUT /api/sentences/:id
// Updates the english and german text of a sentence
app.put('/api/sentences/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { english, german } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID parameter' });
      return;
    }

    if (!english || !german) {
      res.status(400).json({ error: 'Both english and german fields are required' });
      return;
    }

    const stmt = db.prepare('UPDATE sentences SET english = ?, german = ? WHERE id = ?');
    const result = stmt.run(english, german, id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Sentence not found' });
      return;
    }

    res.json({ success: true, id, english, german });
  } catch (error) {
    console.error(`Error updating sentence ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/test/due
// Fetches sentences that are due for FSRS review
app.get('/api/test/due', (req, res) => {
  try {
    const mode = req.query.mode as string;
    let difficultyFilter = '';
    
    if (mode === 'hard') {
      difficultyFilter = ' AND IFNULL(fsrs_difficulty, 5.0) > 5.0';
    } else if (mode === 'good') {
      difficultyFilter = ' AND IFNULL(fsrs_difficulty, 5.0) > 3.0 AND IFNULL(fsrs_difficulty, 5.0) <= 5.0';
    } else if (mode === 'easy') {
      difficultyFilter = ' AND IFNULL(fsrs_difficulty, 5.0) <= 3.0';
    }

    const query = `
      SELECT * FROM sentences 
      WHERE is_learning = 1 
        AND (fsrs_due <= datetime('now', 'localtime') OR fsrs_due IS NULL OR fsrs_due <= CURRENT_TIMESTAMP)
        ${difficultyFilter}
      ORDER BY fsrs_due ASC 
      LIMIT 20
    `;
    const stmt = db.prepare(query);
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
  let difficulty = currentData.fsrs_difficulty || 5.0; 
  let reps = (currentData.fsrs_reps || 0) + 1;
  let lapses = currentData.fsrs_lapses || 0;
  let nextDue = new Date(now);

  // Dynamically update difficulty based on rating
  if (rating === 1) difficulty = Math.min(10, difficulty + 2);
  else if (rating === 2) difficulty = Math.min(10, difficulty + 1);
  else if (rating === 3) difficulty = Math.max(1, difficulty - 1);
  else if (rating === 4) difficulty = Math.max(1, difficulty - 2);

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
    fsrs_due: nextDue.toISOString().replace('T', ' ').split('.')[0], // SQLite safe DATETIME format
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
    const { id, rating, time_taken_ms } = req.body;

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

    // Update the database and insert a review log inside a transaction
    const updateSentenceStmt = db.prepare(`
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

    const insertLogStmt = db.prepare(`
      INSERT INTO review_logs (sentence_id, rating, time_taken_ms)
      VALUES (?, ?, ?)
    `);

    const reviewTransaction = db.transaction((metrics, sentenceId, reviewRating, timeTaken) => {
      updateSentenceStmt.run(
        metrics.fsrs_due,
        metrics.fsrs_stability,
        metrics.fsrs_difficulty,
        metrics.fsrs_reps,
        metrics.fsrs_lapses,
        sentenceId
      );
      
      insertLogStmt.run(sentenceId, reviewRating, timeTaken || null);
    });

    reviewTransaction(newMetrics, id, rating, time_taken_ms);

    res.json({ success: true, metrics: newMetrics });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/overview
// Returns counts for Total, Not Started, Learning, and Mastered
app.get('/api/stats/overview', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_learning = 0 THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN is_learning = 1 AND (fsrs_stability < 21 OR fsrs_stability IS NULL) THEN 1 ELSE 0 END) as learning,
        SUM(CASE WHEN is_learning = 1 AND fsrs_stability >= 21 THEN 1 ELSE 0 END) as mastered
      FROM sentences;
    `);
    const result = stmt.get() as any;
    
    // Convert nulls to 0 in case the table is empty
    res.json({
      total: result.total || 0,
      not_started: result.not_started || 0,
      learning: result.learning || 0,
      mastered: result.mastered || 0
    });
  } catch (error) {
    console.error('Error fetching stats overview:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/retention
// Calculates the global retention rate
app.get('/api/stats/retention', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating IN (2, 3, 4) THEN 1 ELSE 0 END) as successful_reviews
      FROM review_logs;
    `);
    const result = stmt.get() as any;
    
    const total = result.total_reviews || 0;
    const successful = result.successful_reviews || 0;
    const retentionRate = total > 0 ? (successful / total) * 100 : 0;
    
    res.json({
      total_reviews: total,
      successful_reviews: successful,
      retention_rate_percent: Number(retentionRate.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching stats retention:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/forecast
// Groups and counts sentences by fsrs_due date for the next 7 days
app.get('/api/stats/forecast', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        date(fsrs_due) as due_date, 
        COUNT(*) as count
      FROM sentences 
      WHERE is_learning = 1 
        AND fsrs_due IS NOT NULL
        AND date(fsrs_due) BETWEEN date('now') AND date('now', '+6 days')
      GROUP BY due_date
      ORDER BY due_date ASC;
    `);
    const results = stmt.all();
    res.json(results);
  } catch (error) {
    console.error('Error fetching stats forecast:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/leeches
// Returns the top 5 sentences with the highest fsrs_lapses
app.get('/api/stats/leeches', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, english, german, fsrs_lapses
      FROM sentences
      WHERE fsrs_lapses > 0
      ORDER BY fsrs_lapses DESC
      LIMIT 5;
    `);
    const results = stmt.all();
    res.json(results);
  } catch (error) {
    console.error('Error fetching stats leeches:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/heatmap
// Returns count of reviews grouped by calendar day for the last 30 days
app.get('/api/stats/heatmap', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        date(reviewed_at) as date, 
        COUNT(*) as count
      FROM review_logs
      WHERE date(reviewed_at) >= date('now', '-30 days')
      GROUP BY date
      ORDER BY date ASC;
    `);
    const results = stmt.all();
    res.json(results);
  } catch (error) {
    console.error('Error fetching stats heatmap:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
