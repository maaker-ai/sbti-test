import type { Metadata } from 'next';
import Link from 'next/link';
import { TYPE_LIBRARY, TYPE_GROUPS } from '@/data/types';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '26 种人格类型总览',
  description: '浏览 SBTI 全部 26 种人格类型：从拿捏者到小丑，从酒鬼到废物，总有一款是你。',
};

export default function TypesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/sbti"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="gradient-text">26 种人格</span>
          </h1>
          <p className="text-zinc-400">按性格倾向分为 5 组，点击查看详情</p>
        </div>
      </div>

      {/* Groups */}
      <div className="px-4 pb-12 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          {TYPE_GROUPS.map((group) => (
            <section key={group.name}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h2 className="text-xl font-bold text-zinc-200">{group.name}</h2>
                <span className="text-sm text-zinc-500">{group.description}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {group.codes.map((code) => {
                  const type = TYPE_LIBRARY[code];
                  if (!type) return null;

                  return (
                    <Link
                      key={code}
                      href={`/sbti/types/${encodeURIComponent(code)}`}
                      className="group p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-600/50 transition-all duration-300 hover:bg-zinc-800/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="text-lg font-black transition-colors"
                          style={{ color: group.color }}
                        >
                          {type.code}
                        </span>
                        <svg
                          className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-zinc-300 mb-1">{type.cn}</div>
                      <div className="text-xs text-zinc-500 line-clamp-2">{type.intro}</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="px-4 py-8 text-center border-t border-zinc-800/50">
        <p className="text-zinc-400 mb-4">想知道你是哪种人格？</p>
        <Link
          href="/sbti/test"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
        >
          开始测试
        </Link>
      </section>

      <Footer />
    </div>
  );
}
