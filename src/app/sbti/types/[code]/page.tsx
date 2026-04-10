import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { TYPE_LIBRARY, TYPE_IMAGES, NORMAL_TYPES, getAllTypeCodes, slugToCode } from '@/data/types';
import { dimensionOrder, dimensionMeta, DIM_EXPLANATIONS } from '@/data/dimensions';
import PatternViz from '@/components/PatternViz';
import Footer from '@/components/Footer';

export function generateStaticParams() {
  return getAllTypeCodes().map((code) => ({
    code: encodeURIComponent(code),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code: rawCode } = await params;
  const code = slugToCode(rawCode);
  const type = TYPE_LIBRARY[code];

  if (!type) {
    return { title: '未知人格类型' };
  }

  return {
    title: `SBTI ${type.code}（${type.cn}）人格详解`,
    description: `${type.intro} — ${type.desc.slice(0, 120)}...`,
  };
}

export default async function TypeDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = slugToCode(rawCode);
  const type = TYPE_LIBRARY[code];

  if (!type) {
    notFound();
  }

  const normalType = NORMAL_TYPES.find((t) => t.code === code);
  const imageUrl = TYPE_IMAGES[code];
  const pattern = normalType?.pattern;
  const patternLevels = pattern ? pattern.replace(/-/g, '').split('') : null;

  const levelColorClass: Record<string, string> = {
    L: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    M: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    H: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/sbti/types"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回总览
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 pb-8 text-center">
        <div className="max-w-2xl mx-auto">
          {imageUrl && (
            <div className="mb-4 flex justify-center">
              <Image
                src={imageUrl}
                alt={type.code}
                width={140}
                height={140}
                className="rounded-2xl"
                unoptimized
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <span className="gradient-text">{type.code}</span>
          </h1>
          <h2 className="text-2xl font-bold text-zinc-200 mb-3">{type.cn}</h2>
          <p className="text-emerald-400 italic text-lg">&ldquo;{type.intro}&rdquo;</p>
        </div>
      </section>

      {/* Description */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <p className="text-sm text-zinc-300 leading-relaxed">{type.desc}</p>
          </div>
        </div>
      </section>

      {/* Standard pattern */}
      {pattern && patternLevels && (
        <section className="px-4 pb-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-zinc-200 mb-4">标准 15 维 Pattern</h3>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="text-center mb-4">
                <code className="text-emerald-400 font-mono text-sm">{pattern}</code>
              </div>
              <div className="space-y-2">
                {dimensionOrder.map((dim, i) => {
                  const level = patternLevels[i];
                  const meta = dimensionMeta[dim];
                  const explanation = DIM_EXPLANATIONS[dim]?.[level] || '';

                  return (
                    <div
                      key={dim}
                      className="flex items-start gap-3 py-2 border-b border-zinc-800/30 last:border-0"
                    >
                      <span className="text-xs text-zinc-500 w-28 flex-shrink-0 pt-0.5">
                        {meta.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-mono font-bold flex-shrink-0 ${levelColorClass[level]}`}
                      >
                        {level}
                      </span>
                      <span className="text-xs text-zinc-500 leading-relaxed">{explanation}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-8 text-center border-t border-zinc-800/50">
        <p className="text-zinc-400 mb-4">你也是{type.cn}吗？去测测看</p>
        <Link
          href="/sbti/test"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
        >
          开始测试
        </Link>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
