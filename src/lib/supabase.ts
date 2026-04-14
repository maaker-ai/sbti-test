import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// 'sbti' for prod, 'sbti_staging' for staging — set at build time.
// Default to 'sbti_staging' so local dev never pollutes prod.
const SCHEMA = (process.env.NEXT_PUBLIC_SBTI_SCHEMA as 'sbti' | 'sbti_staging') || 'sbti_staging';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, ms);
    p.then((v) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(v);
      }
    }).catch(() => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(null);
      }
    });
  });
}

export interface CompletionRecord {
  globalId: number;
  typeId: number;
  date: string;
}

/** Warm up Supabase client + network path so the first recordCompletion call is fast. Safe to call anywhere. */
export function warmUpSupabase(): void {
  getClient();
}

export async function recordCompletion(typeCode: string): Promise<CompletionRecord | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const call: Promise<CompletionRecord | null> = Promise.resolve(
      client.schema(SCHEMA).rpc('complete', { p_type_code: typeCode })
    )
      .then((res) => {
        if (res.error) return null;
        const data = res.data as
          | Array<{ global_id: number | string; type_id: number | string; type_code: string; date: string }>
          | null;
        if (!data || !data.length) return null;
        const row = data[0];
        return {
          globalId: Number(row.global_id),
          typeId: Number(row.type_id),
          date: row.date,
        } satisfies CompletionRecord;
      })
      .catch(() => null);

    const result = await withTimeout(call, 2000);
    return result ?? null;
  } catch {
    return null;
  }
}

export async function getTotalCount(): Promise<number | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .schema(SCHEMA)
      .from('total_count')
      .select('total')
      .single();
    if (error || !data) return null;
    const total = (data as { total: number | string }).total;
    const n = Number(total);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
