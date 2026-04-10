import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { TYPE_LIBRARY, TYPE_IMAGES, NORMAL_TYPES, getAllTypeCodes, slugToCode, DEFAULT_THEME } from '@/data/types';
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

  const imageUrl = TYPE_IMAGES[code];
  const descSnippet = `${type.intro} — ${type.desc.slice(0, 100)}`;

  return {
    title: `SBTI ${type.code}（${type.cn}）人格详解`,
    description: descSnippet,
    openGraph: {
      title: `SBTI ${type.code}（${type.cn}）人格详解`,
      description: descSnippet,
      url: `https://maaker.cn/sbti/types/${encodeURIComponent(type.code)}`,
      images: imageUrl ? [{ url: imageUrl, width: 1024, height: 1024, alt: `${type.code} ${type.cn}` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `SBTI ${type.code}（${type.cn}）— 你是这种人格吗？`,
      description: type.intro,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `https://maaker.cn/sbti/types/${encodeURIComponent(type.code)}`,
    },
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
  const theme = type.theme ?? DEFAULT_THEME;
  const pattern = normalType?.pattern;
  const patternLevels = pattern ? pattern.replace(/-/g, '').split('') : null;

  const levelColorClass: Record<string, string> = {
    L: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    M: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    H: 'text-accent bg-accent/10 border-accent/20',
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `SBTI ${type.code}（${type.cn}）人格详解`,
    description: type.intro,
    image: imageUrl ? `https://maaker.cn${imageUrl}` : undefined,
    url: `https://maaker.cn/sbti/types/${encodeURIComponent(type.code)}`,
    publisher: {
      '@type': 'Organization',
      name: 'SBTI 人格测试',
      url: 'https://maaker.cn/sbti',
    },
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="px-4 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/sbti/types"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回总览
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative px-4 pb-10 text-center overflow-hidden">
        <div
          className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: theme.glow }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {imageUrl && (
            <div className="mb-5 flex justify-center">
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

          <h1 className="font-display text-5xl md:text-6xl mb-3">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
            >
              {type.code}
            </span>
          </h1>
          <h2 className="font-display text-2xl text-foreground mb-4">{type.cn}</h2>
          <p className="italic text-lg" style={{ color: theme.accent }}>&ldquo;{type.intro}&rdquo;</p>
        </div>
      </section>

      {/* Description */}
      <section className="px-4 pb-10">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-xl bg-card/50 border border-border/30">
            <p className="text-sm text-card-foreground leading-relaxed">{type.desc}</p>
          </div>
        </div>
      </section>

      {/* Standard pattern */}
      {pattern && patternLevels && (
        <section className="px-4 pb-10">
          <div className="max-w-2xl mx-auto">
            <h3 className="font-display text-xl text-foreground mb-5">标准 15 维 Pattern</h3>
            <div className="p-5 rounded-xl bg-card/50 border border-border/30">
              <div className="text-center mb-5">
                <code className="text-primary font-mono text-sm">{pattern}</code>
              </div>
              <div className="space-y-2">
                {dimensionOrder.map((dim, i) => {
                  const level = patternLevels[i];
                  const meta = dimensionMeta[dim];
                  const explanation = DIM_EXPLANATIONS[dim]?.[level] || '';

                  return (
                    <div
                      key={dim}
                      className="flex items-start gap-3 py-2.5 border-b border-border/20 last:border-0"
                    >
                      <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">
                        {meta.name}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold flex-shrink-0 ${levelColorClass[level]}`}
                      >
                        {level}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{explanation}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-10 text-center border-t border-border/30">
        <p className="text-muted-foreground mb-5">你也是{type.cn}吗？去测测看</p>
        <Link
          href="/sbti/test"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold transition-all duration-300 hover:scale-105 glow-primary btn-press min-h-[48px]"
        >
          开始测试
        </Link>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
