import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _sb;
export function sb() {
  if (!_sb) {
    if (!url || !serviceKey) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    _sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return _sb;
}

// snake_case <-> camelCase helpers for top-level keys only.
const toCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnake = (k) => k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());

export function fromRow(row) {
  if (!row) return row;
  if (Array.isArray(row)) return row.map(fromRow);
  if (typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;
  return out;
}

export function toRow(obj) {
  if (!obj) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'id' || k === '_id') continue;
    out[toSnake(k)] = v;
  }
  return out;
}
