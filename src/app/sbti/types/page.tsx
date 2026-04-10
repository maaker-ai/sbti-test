import type { Metadata } from 'next';
import Link from 'next/link';
import { TYPE_LIBRARY, TYPE_GROUPS } from '@/data/types';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '26种人格类型总览',
  description: '探索 SBTI 的 26 种独特人格类型 — 拿捏者、酒鬼、小丑、尤物、死者...找到属于你的那一个。',
  openGraph: {
    title: 'SBTI 26种人格类型总览',
    description: '探索 SBTI 的 26 种独特人格类型 — 拿捏者、酒鬼、小丑、尤物、死者...找到属于你的那一个。',
    url: 'https://maaker.cn/sbti/types',
  },
  alternates: {
    canonical: 'https://maaker.cn/sbti/types',
  },
};

export default function TypesPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/sbti"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="font-display text-4xl md:text-5xl mb-3">
            <span className="gradient-text">26 种人格</span>
          </h1>
          <p className="text-muted-foreground">按性格倾向分为 5 组，点击查看详情</p>
        </div>
      </div>

      {/* Groups */}
      <div className="px-4 pb-16 flex-1">
        <div className="max-w-4xl mx-auto space-y-12">
          {TYPE_GROUPS.map((group) => (
            <section key={group.name}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h2 className="font-display text-xl text-foreground">{group.name}</h2>
                <span className="text-sm text-muted-foreground">{group.description}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {group.codes.map((code) => {
                  const type = TYPE_LIBRARY[code];
                  if (!type) return null;

                  return (
                    <Link
                      key={code}
                      href={`/sbti/types/${encodeURIComponent(code)}`}
                      className="group p-5 rounded-xl bg-card/50 border border-border/30 card-glow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="text-lg font-display transition-colors"
                          style={{ color: group.color }}
                        >
                          {type.code}
                        </span>
                        <svg
                          className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors mt-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-card-foreground mb-1">{type.cn}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{type.intro}</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="px-4 py-10 text-center border-t border-border/30">
        <p className="text-muted-foreground mb-5">想知道你是哪种人格？</p>
        <Link
          href="/sbti/test"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold transition-all duration-300 hover:scale-105 glow-primary btn-press min-h-[48px]"
        >
          开始测试
        </Link>
      </section>

      <Footer />
    </div>
  );
}
