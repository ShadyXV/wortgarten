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

export const updateSentence = async (id: number, data: { english: string; german: string }) => {
  const res = await fetch(`${API_BASE}/sentences/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update sentence');
  return res.json();
};
