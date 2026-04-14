'use client';

import { useEffect, useState } from 'react';
import { getTotalCount } from '@/lib/supabase';

/**
 * Landing-page social proof. Fetches the global completion counter on mount.
 * Renders nothing on loading/failure — no skeleton, no error state.
 */
export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTotalCount().then((n) => {
      if (!cancelled && typeof n === 'number') setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count == null) return null;

  return (
    <p className="mt-3 text-xs text-muted-foreground/70">
      已有 {count.toLocaleString('en-US')} 人测过
    </p>
  );
}
