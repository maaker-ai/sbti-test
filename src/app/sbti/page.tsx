import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { TYPE_LIBRARY, TYPE_IMAGES, TYPE_THUMBS, TYPE_GROUPS } from '@/data/types';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '发现你的隐藏人格 | SBTI 人格测试',
  description:
    '15个维度、26种人格、30道题 — 用最离谱的方式揭示你最真实的人格画像。SBTI（Super Bullshit Type Indicator）比 MBTI 更有趣的人格测试。',
  openGraph: {
    title: 'SBTI 人格测试 — 发现你的隐藏人格',
    description: '15个维度、26种人格、30道题 — 你是拿捏者、小丑、还是……酒鬼？',
    url: 'https://maaker.cn/sbti',
    images: [{ url: '/images/CTRL.png', width: 1024, height: 1024, alt: 'SBTI 人格测试' }],
  },
  alternates: {
    canonical: 'https://maaker.cn/sbti',
  },
};

/* ── inline SVG icons for 5 models (replaces emoji) ── */
const ModelIcons = {
  mirror: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 7v10M8 9l4-2 4 2M8 15l4 2 4-2" />
    </svg>
  ),
  heart: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  globe: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  zap: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  users: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SBTI 人格测试',
  alternateName: 'Super Bullshit Type Indicator',
  url: 'https://maaker.cn/sbti',
  inLanguage: 'zh-CN',
  description:
    '15个维度、26种人格、30道题 — 用最离谱的方式揭示你最真实的人格画像。SBTI（Super Bullshit Type Indicator）比 MBTI 更有趣的人格测试。',
  publisher: {
    '@type': 'Organization',
    name: 'Maaker.AI',
    url: 'https://maaker.cn',
  },
};

const quizSchema = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'SBTI 人格测试',
  url: 'https://maaker.cn/sbti',
  about: {
    '@type': 'Thing',
    name: '人格测试',
  },
  educationalLevel: 'Entertainment',
  numberOfQuestions: 30,
  inLanguage: 'zh-CN',
};

export default function SBTIHome() {
  // Pick some interesting types for preview
  const previewCodes = ['CTRL', 'JOKE-R', 'DRUNK', 'SEXY', 'DEAD', 'FUCK', 'MUM', 'IMSB'];
  const previewTypes = previewCodes.map((code) => TYPE_LIBRARY[code]).filter(Boolean);

  // Hero avatar showcase — pick 8 types that have images
  const avatarCodes = ['CTRL', 'SEXY', 'JOKE-R', 'BOSS', 'DEAD', 'GOGO', 'MUM', 'DRUNK'];
  const avatarTypes = avatarCodes.filter((c) => TYPE_THUMBS[c]);

  return (
    <div className="min-h-dvh flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema, quizSchema]),
        }}
      />
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-28 pb-24 text-center overflow-hidden noise-bg">
        {/* Background gradient orbs — multi-color for richness */}
        <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none" style={{ background: 'rgba(168,85,247,0.18)' }} />
        <div className="absolute bottom-[-100px] right-[-120px] w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(236,72,153,0.12)' }} />
        <div className="absolute top-[250px] left-[-120px] w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(245,158,11,0.10)' }} />
        <div className="absolute top-[100px] right-[10%] w-[200px] h-[200px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(16,185,129,0.10)' }} />
        <div className="absolute bottom-[20%] left-[15%] w-[180px] h-[180px] rounded-full blur-[90px] pointer-events-none" style={{ background: 'rgba(124,58,237,0.10)' }} />

        <div className="relative z-10 max-w-2xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            15 维度 · 26 种人格 · 30 道题
          </div>

          <h1 className="font-display text-7xl md:text-8xl tracking-tight mb-3">
            <span className="gradient-text">SBTI</span>
          </h1>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
            人格测试
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
            用最离谱的方式，揭示你最真实的人格画像。
            <br />
            <span className="text-secondary">你是拿捏者、小丑、还是……酒鬼？</span>
          </p>

          {/* Character avatar showcase */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="flex -space-x-3">
              {avatarTypes.map((code, i) => (
                <div
                  key={code}
                  className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-background overflow-hidden ring-1 ring-[#EC4899]/30"
                  style={{ zIndex: avatarTypes.length - i }}
                >
                  <Image
                    src={TYPE_THUMBS[code]}
                    alt={TYPE_LIBRARY[code]?.cn || code}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              26 种离谱人格等你解锁
            </span>
          </div>

          <Link
            href="/sbti/test"
            className="inline-flex items-center gap-2 px-10 py-4.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F59E0B] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_25px_rgba(236,72,153,0.4),0_0_60px_rgba(168,85,247,0.2)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5),0_0_80px_rgba(168,85,247,0.3)] btn-press"
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
      <section className="px-6 py-20 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl mb-6 text-foreground">这不是普通的人格测试</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto text-base md:text-lg">
            SBTI（Super Bullshit Type Indicator）基于 5 大模型、15 个维度构建，
            涵盖自我认知、情感模式、人生态度、行动驱力和社交风格。
            <br className="hidden md:block" />
            每一种人格都有独特的、<span className="text-secondary font-medium">令人窒息的精准描述</span>。
          </p>
        </div>
      </section>

      {/* Type preview */}
      <section className="px-6 py-20 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-3 text-center text-foreground">26 种人格，总有一款适合你</h2>
          <p className="text-sm text-muted-foreground text-center mb-12">部分人格预览</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {previewTypes.map((type) => {
              const hasImage = TYPE_THUMBS[type.code];
              return (
                <Link
                  key={type.code}
                  href={`/sbti/types/${encodeURIComponent(type.code)}`}
                  className="group relative p-5 rounded-xl bg-card/60 border transition-all duration-300 hover:scale-[1.03]"
                  style={{
                    borderColor: `${type.theme.accent}33`,
                  }}
                >
                  {/* Hover glow overlay */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `0 0 25px ${type.theme.glow}, 0 0 50px ${type.theme.glow}`,
                    }}
                  />

                  {/* Character image */}
                  {hasImage && (
                    <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden"
                      style={{ boxShadow: `0 0 0 2px var(--card), 0 0 0 4px ${type.theme.accent}` }}
                    >
                      <Image
                        src={TYPE_THUMBS[type.code]}
                        alt={type.cn}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div
                    className="text-lg font-black mb-1.5 group-hover:brightness-125 transition-all font-display text-center"
                    style={{ color: type.theme.accent }}
                  >
                    {type.code}
                  </div>
                  <div className="text-sm font-medium text-card-foreground mb-1 text-center">{type.cn}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 text-center">{type.intro}</div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
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
      <section className="relative px-6 py-20 border-t border-border/30 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl mb-12 text-center text-foreground">五大模型，十五个维度</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
            {[
              { name: '自我模型', dims: ['自尊自信', '自我清晰度', '核心价值'], icon: ModelIcons.mirror, color: '#A78BFA' },
              { name: '情感模型', dims: ['依恋安全感', '情感投入度', '边界与依赖'], icon: ModelIcons.heart, color: '#F472B6' },
              { name: '态度模型', dims: ['世界观倾向', '规则与灵活度', '人生意义感'], icon: ModelIcons.globe, color: '#38BDF8' },
              { name: '行动驱力', dims: ['动机导向', '决策风格', '执行模式'], icon: ModelIcons.zap, color: '#FBBF24' },
              { name: '社交模型', dims: ['社交主动性', '人际边界感', '表达与真实度'], icon: ModelIcons.users, color: '#34D399' },
            ].map((model) => (
              <div
                key={model.name}
                className="p-5 rounded-xl bg-card/60 border border-border/30 card-glow"
              >
                <div className="mb-3" style={{ color: model.color }}>
                  {model.icon}
                </div>
                <div className="text-sm font-bold text-foreground mb-2">{model.name}</div>
                <ul className="space-y-1.5">
                  {model.dims.map((d) => (
                    <li key={d} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: model.color }} />
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
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative">
          <p className="text-muted-foreground mb-6 text-lg">准备好了吗？</p>
          <Link
            href="/sbti/test"
            className="inline-flex items-center gap-2 px-10 py-4.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F59E0B] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_25px_rgba(236,72,153,0.4),0_0_60px_rgba(168,85,247,0.2)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5),0_0_80px_rgba(168,85,247,0.3)] btn-press"
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
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
