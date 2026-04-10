import type { Sentence } from './types';

const API_BASE = 'http://localhost:3001/api';

export const fetchLearn = async (): Promise<Sentence[]> => {
  const res = await fetch(`${API_BASE}/learn`);
  if (!res.ok) throw new Error('Failed to fetch learn sentences');
  return res.json();
};

export const markAsLearning = async (id: number): Promise<{ success: boolean; id: number }> => {
  const res = await fetch(`${API_BASE}/learn/${id}`, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to mark sentence as learning');
  return res.json();
};

export const fetchDueTest = async (): Promise<Sentence[]> => {
  const res = await fetch(`${API_BASE}/test/due`);
  if (!res.ok) throw new Error('Failed to fetch due sentences');
  return res.json();
};

export const fetchRandom = async (): Promise<Sentence> => {
  const res = await fetch(`${API_BASE}/random`);
  if (!res.ok) throw new Error('Failed to fetch random sentence');
  return res.json();
};

export const submitReview = async (id: number, rating: 1 | 2 | 3 | 4): Promise<{ success: boolean }> => {
  const res = await fetch(`${API_BASE}/test/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, rating }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
};
