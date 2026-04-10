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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
