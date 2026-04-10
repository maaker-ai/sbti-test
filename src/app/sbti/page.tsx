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
    <div className="min-h-dvh flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden noise-bg">
        {/* Background gradient orbs — purple */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-100px] w-[350px] h-[350px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[200px] left-[-100px] w-[250px] h-[250px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            15 维度 · 26 种人格 · 30 道题
          </div>

          <h1 className="font-display text-6xl md:text-7xl tracking-tight mb-5">
            <span className="gradient-text">SBTI</span>
            <br />
            <span className="text-foreground">人格测试</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
            用最离谱的方式，揭示你最真实的人格画像。
            <br />
            你是拿捏者、小丑、还是……酒鬼？
          </p>

          <Link
            href="/sbti/test"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg transition-all duration-300 hover:scale-105 glow-primary glow-primary-hover btn-press"
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

          <p className="mt-5 text-sm text-muted-foreground/70">约 3-5 分钟 · 无需注册</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl mb-5 text-foreground">这不是普通的人格测试</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            SBTI（Super Bullshit Type Indicator）基于 5 大模型、15 个维度构建，
            涵盖自我认知、情感模式、人生态度、行动驱力和社交风格。
            每一种人格都有独特的、令人窒息的精准描述。
          </p>
        </div>
      </section>

      {/* Type preview */}
      <section className="px-6 py-16 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-3 text-center text-foreground">26 种人格，总有一款适合你</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">部分人格预览</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewTypes.map((type) => (
              <Link
                key={type.code}
                href={`/sbti/types/${encodeURIComponent(type.code)}`}
                className="group p-5 rounded-xl bg-card/50 border border-border/30 card-glow"
              >
                <div className="text-lg font-black text-primary mb-1.5 group-hover:text-secondary transition-colors font-display">
                  {type.code}
                </div>
                <div className="text-sm font-medium text-card-foreground mb-1">{type.cn}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{type.intro}</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/sbti/types"
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-secondary transition-colors"
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
      <section className="px-6 py-16 border-t border-border/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-10 text-center text-foreground">五大模型，十五个维度</h2>
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
                className="p-5 rounded-xl bg-card/50 border border-border/30 card-glow"
              >
                <div className="text-2xl mb-3">{model.icon}</div>
                <div className="text-sm font-bold text-foreground mb-2">{model.name}</div>
                <ul className="space-y-1.5">
                  {model.dims.map((d) => (
                    <li key={d} className="text-xs text-muted-foreground">
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
      <section className="px-6 py-20 text-center">
        <Link
          href="/sbti/test"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg transition-all duration-300 hover:scale-105 glow-primary glow-primary-hover btn-press"
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
