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

export const fetchDueTest = async (mode: string = 'all'): Promise<Sentence[]> => {
  const res = await fetch(`${API_BASE}/test/due?mode=${mode}`);
  if (!res.ok) throw new Error('Failed to fetch due sentences');
  return res.json();
};

export const fetchTestCounts = async (): Promise<{ all: number; easy: number; good: number; hard: number; again: number }> => {
  const res = await fetch(`${API_BASE}/test/counts`);
  if (!res.ok) throw new Error('Failed to fetch test counts');
  return res.json();
};

export const fetchRandom = async (): Promise<Sentence> => {
  const res = await fetch(`${API_BASE}/random`);
  if (!res.ok) throw new Error('Failed to fetch random sentence');
  return res.json();
};

export const submitReview = async (id: number, rating: 1 | 2 | 3 | 4, time_taken_ms?: number): Promise<{ success: boolean }> => {
  const res = await fetch(`${API_BASE}/test/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, rating, time_taken_ms }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
};

export const fetchStatsOverview = async () => {
  const res = await fetch(`${API_BASE}/stats/overview`);
  if (!res.ok) throw new Error('Failed to fetch stats overview');
  return res.json();
};

export const fetchStatsRetention = async () => {
  const res = await fetch(`${API_BASE}/stats/retention`);
  if (!res.ok) throw new Error('Failed to fetch stats retention');
  return res.json();
};

export const fetchStatsForecast = async () => {
  const res = await fetch(`${API_BASE}/stats/forecast`);
  if (!res.ok) throw new Error('Failed to fetch stats forecast');
  return res.json();
};

export const fetchStatsLeeches = async () => {
  const res = await fetch(`${API_BASE}/stats/leeches`);
  if (!res.ok) throw new Error('Failed to fetch stats leeches');
  return res.json();
};

export const fetchStatsHeatmap = async () => {
  const res = await fetch(`${API_BASE}/stats/heatmap`);
  if (!res.ok) throw new Error('Failed to fetch stats heatmap');
  return res.json();
};

export const fetchManageSentences = async (page: number, query: string = '', difficulty: string = 'all') => {
  const res = await fetch(`${API_BASE}/sentences?page=${page}&limit=20&q=${encodeURIComponent(query)}&difficulty=${encodeURIComponent(difficulty)}`);
  if (!res.ok) throw new Error('Failed to fetch sentences for management');
  return res.json();
};

export const updateSentence = async (id: number, data: { english: string; german: string; fsrs_difficulty?: number; is_learning?: number }) => {
  const res = await fetch(`${API_BASE}/sentences/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update sentence');
  return res.json();
};
