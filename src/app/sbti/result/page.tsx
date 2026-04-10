'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  computeResult,
  decodeResult,
  decodeShareUrl,
  dimensionMeta,
  dimensionOrder,
  DIM_EXPLANATIONS,
} from '@/data/scoring';
import { TYPE_IMAGES, DEFAULT_THEME } from '@/data/types';
import RadarChart from '@/components/RadarChart';
import SharePoster from '@/components/SharePoster';
import Footer from '@/components/Footer';

function ResultContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d');
  const posterRef = useRef<HTMLDivElement>(null);
  const [posterGenerating, setPosterGenerating] = useState(false);

  const shareEncoded = searchParams.get('r');

  const result = useMemo(() => {
    // New compact format: ?r=TYPE.sim.exact.levels.scores
    if (shareEncoded) {
      return decodeShareUrl(shareEncoded);
    }
    // Legacy format: ?d=base64
    if (encoded) {
      const answers = decodeResult(encoded);
      if (!answers) return null;
      return computeResult(answers);
    }
    return null;
  }, [encoded, shareEncoded]);

  const generatePoster = useCallback(async () => {
    if (!posterRef.current || posterGenerating) return;
    setPosterGenerating(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(posterRef.current, {
        backgroundColor: '#0F0F23',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `SBTI-${result?.finalType.code || 'result'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to generate poster:', e);
    } finally {
      setPosterGenerating(false);
    }
  }, [posterGenerating, result]);

  const copyShareLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板');
    });
  }, []);

  if (!result) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4">
        <h1 className="font-display text-2xl mb-4 text-foreground">无效的结果数据</h1>
        <p className="text-muted-foreground mb-8">请重新进行测试</p>
        <Link
          href="/sbti/test"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold transition-colors btn-press"
        >
          重新测试
        </Link>
      </div>
    );
  }

  const { finalType, badge, sub, modeKicker, levels, rawScores, special, secondaryType } = result;
  const imageUrl = TYPE_IMAGES[finalType.code];
  const theme = finalType.theme ?? DEFAULT_THEME;

  const levelColorClass: Record<string, string> = {
    L: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    M: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    H: 'text-accent bg-accent/10 border-accent/20',
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Hidden poster for image export */}
      <SharePoster
        ref={posterRef}
        finalType={finalType}
        badge={badge}
        levels={levels}
        rawScores={rawScores}
        imageUrl={imageUrl}
        theme={theme}
      />

      {/* Page content */}
      <div className="bg-background">

        {/* ===== Hero: visual impact + content flows naturally ===== */}
        <section className="relative px-4 pt-16 pb-10 text-center overflow-hidden">
          {/* Background glows */}
          <div
            className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: theme.glow.replace('0.12', '0.2') }}
          />
          <div
            className="absolute bottom-[-80px] right-[-60px] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: theme.glow }}
          />

          <div className="relative z-10 max-w-lg mx-auto animate-fade-in-up">
            <p className="text-xs font-medium mb-6 uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
              {modeKicker}
            </p>

            {/* Character image */}
            {imageUrl && (
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div
                    className="absolute -inset-3 rounded-3xl blur-2xl opacity-40"
                    style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
                  />
                  <Image
                    src={imageUrl}
                    alt={finalType.code}
                    width={160}
                    height={160}
                    className="rounded-2xl relative"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Type code */}
            <h1 className="font-display text-6xl md:text-7xl mb-2">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
              >
                {finalType.code}
              </span>
            </h1>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">{finalType.cn}</h2>

            {/* Badge */}
            <div
              className="inline-flex px-4 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ color: theme.accent, background: `${theme.accent}12`, border: `1px solid ${theme.accent}30` }}
            >
              {badge}
            </div>

            {/* Intro quote */}
            <p className="text-lg md:text-xl italic leading-relaxed px-4 mb-0" style={{ color: `${theme.accent}DD` }}>
              &ldquo;{finalType.intro}&rdquo;
            </p>
          </div>
        </section>

        {/* Description — flows naturally into view, no scroll guessing */}
        <section className="px-4 pt-6 pb-10">
          <div className="max-w-lg mx-auto">
            <div className="p-6 rounded-xl bg-card/50 border border-border/30">
              <p className="text-sm text-card-foreground leading-relaxed">{finalType.desc}</p>
            </div>
          </div>
        </section>

        {/* Action buttons — after reading the analysis, higher conversion */}
        <section className="px-4 pb-10">
          <div className="max-w-lg mx-auto space-y-3">
            <button
              onClick={generatePoster}
              disabled={posterGenerating}
              className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 btn-press min-h-[48px]"
              style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`, boxShadow: `0 0 20px ${theme.accent}30` }}
            >
              {posterGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  保存结果海报
                </>
              )}
            </button>

            <button
              onClick={copyShareLink}
              className="w-full py-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              style={{ borderColor: `${theme.accent}30`, color: theme.accent }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              复制分享链接
            </button>
          </div>
        </section>

        {/* Secondary type for DRUNK */}
        {special && secondaryType && (
          <section className="px-4 pb-10">
            <div className="max-w-lg mx-auto">
              <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs text-amber-400 mb-2">你的常规人格匹配</p>
                <p className="text-sm text-card-foreground">
                  <span className="font-bold text-amber-300">{secondaryType.code}</span>{' '}
                  {TYPE_LIBRARY_CN[secondaryType.code]} — 匹配度 {secondaryType.similarity}%
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Radar chart */}
        <section className="px-4 pb-10">
          <div className="max-w-lg mx-auto">
            <h3 className="font-display text-xl text-foreground mb-5 text-center">15 维度画像</h3>
            <div className="flex justify-center">
              <RadarChart levels={levels} />
            </div>
          </div>
        </section>

        {/* Dimension details */}
        <section className="px-4 pb-10">
          <div className="max-w-lg mx-auto space-y-2">
            {dimensionOrder.map((dim) => {
              const level = levels[dim];
              const explanation = DIM_EXPLANATIONS[dim][level];
              const meta = dimensionMeta[dim];

              return (
                <div
                  key={dim}
                  className="p-4 rounded-xl bg-card/30 border border-border/20"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-card-foreground">{meta.name}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${levelColorClass[level]}`}
                    >
                      {level} / {rawScores[dim]}分
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Bottom nav */}
      <section className="px-4 py-8 border-t border-border/30">
        <div className="max-w-lg mx-auto flex gap-3">
          <Link
            href="/sbti/test"
            className="flex-1 py-3 rounded-xl border border-border/30 hover:border-border/50 text-muted-foreground text-sm font-medium transition-colors flex items-center justify-center min-h-[44px]"
          >
            重新测试
          </Link>

          <Link
            href="/sbti/types"
            className="w-full py-3.5 rounded-xl text-muted-foreground/70 hover:text-muted-foreground font-medium transition-colors flex items-center justify-center gap-1 text-sm min-h-[44px]"
          >
            查看全部 26 种人格
          </Link>
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}

// Need to avoid compile error for secondaryType cn lookup
const TYPE_LIBRARY_CN: Record<string, string> = {
  CTRL: '拿捏者', 'ATM-er': '送钱者', 'Dior-s': '屌丝', BOSS: '领导者',
  'THAN-K': '感恩者', 'OH-NO': '哦不人', GOGO: '行者', SEXY: '尤物',
  'LOVE-R': '多情者', MUM: '妈妈', FAKE: '伪人', OJBK: '无所谓人',
  MALO: '吗喽', 'JOKE-R': '小丑', 'WOC!': '握草人', 'THIN-K': '思考者',
  SHIT: '愤世者', ZZZZ: '装死者', POOR: '贫困者', MONK: '僧人',
  IMSB: '傻者', SOLO: '孤儿', FUCK: '草者', DEAD: '死者',
  IMFW: '废物', HHHH: '傻乐者', DRUNK: '酒鬼',
};

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-background">
          <div className="text-muted-foreground">加载结果中...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
