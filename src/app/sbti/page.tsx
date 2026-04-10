import type { Metadata } from 'next';
import Link from 'next/link';
import { TYPE_LIBRARY, TYPE_GROUPS } from '@/data/types';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '发现你的隐藏人格',
  description:
    '15个维度、26种人格、30道题 — 用最离谱的方式揭示你最真实的人格画像。',
};

export default function SBTIHome() {
  // Pick some interesting types for preview
  const previewCodes = ['CTRL', 'JOKE-R', 'DRUNK', 'SEXY', 'DEAD', 'FUCK', 'MUM', 'IMSB'];
  const previewTypes = previewCodes.map((code) => TYPE_LIBRARY[code]).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center overflow-hidden noise-bg">
        {/* Background gradient orbs */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-100px] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-zinc-700/50 bg-zinc-800/50 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            15 维度 · 26 种人格 · 30 道题
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            <span className="gradient-text">SBTI</span>
            <br />
            <span className="text-zinc-100">人格测试</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
            用最离谱的方式，揭示你最真实的人格画像。
            <br />
            你是拿捏者、小丑、还是……酒鬼？
          </p>

          <Link
            href="/sbti/test"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 glow-accent"
          >
            开始测试
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <p className="mt-4 text-sm text-zinc-500">约 3-5 分钟 · 无需注册</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-12 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-zinc-200">这不是普通的人格测试</h2>
          <p className="text-zinc-400 leading-relaxed max-w-xl mx-auto">
            SBTI（Super Bullshit Type Indicator）基于 5 大模型、15 个维度构建，
            涵盖自我认知、情感模式、人生态度、行动驱力和社交风格。
            每一种人格都有独特的、令人窒息的精准描述。
          </p>
        </div>
      </section>

      {/* Type preview */}
      <section className="px-6 py-12 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center text-zinc-200">26 种人格，总有一款适合你</h2>
          <p className="text-sm text-zinc-500 text-center mb-8">部分人格预览</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {previewTypes.map((type) => (
              <Link
                key={type.code}
                href={`/sbti/types/${encodeURIComponent(type.code)}`}
                className="group p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300 hover:bg-zinc-800/50"
              >
                <div className="text-lg font-black text-emerald-500 mb-1 group-hover:text-emerald-400 transition-colors">
                  {type.code}
                </div>
                <div className="text-sm font-medium text-zinc-300 mb-1">{type.cn}</div>
                <div className="text-xs text-zinc-500 line-clamp-2">{type.intro}</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/sbti/types"
              className="inline-flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              查看全部 26 种人格
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Models */}
      <section className="px-6 py-12 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-zinc-200">五大模型，十五个维度</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { name: '自我模型', dims: ['自尊自信', '自我清晰度', '核心价值'], icon: '🪞' },
              { name: '情感模型', dims: ['依恋安全感', '情感投入度', '边界与依赖'], icon: '💗' },
              { name: '态度模型', dims: ['世界观倾向', '规则与灵活度', '人生意义感'], icon: '🌍' },
              { name: '行动驱力', dims: ['动机导向', '决策风格', '执行模式'], icon: '⚡' },
              { name: '社交模型', dims: ['社交主动性', '人际边界感', '表达与真实度'], icon: '👥' },
            ].map((model) => (
              <div
                key={model.name}
                className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
              >
                <div className="text-2xl mb-2">{model.icon}</div>
                <div className="text-sm font-bold text-zinc-200 mb-2">{model.name}</div>
                <ul className="space-y-1">
                  {model.dims.map((d) => (
                    <li key={d} className="text-xs text-zinc-500">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <Link
          href="/sbti/test"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 glow-accent"
        >
          开始测试
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
