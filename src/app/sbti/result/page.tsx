'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  computeResult,
  decodeResult,
  dimensionMeta,
  dimensionOrder,
  DIM_EXPLANATIONS,
} from '@/data/scoring';
import { TYPE_IMAGES } from '@/data/types';
import RadarChart from '@/components/RadarChart';
import Footer from '@/components/Footer';

function ResultContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d');
  const posterRef = useRef<HTMLDivElement>(null);
  const [posterGenerating, setPosterGenerating] = useState(false);

  const result = useMemo(() => {
    if (!encoded) return null;
    const answers = decodeResult(encoded);
    if (!answers) return null;
    return computeResult(answers);
  }, [encoded]);

  const generatePoster = useCallback(async () => {
    if (!posterRef.current || posterGenerating) return;
    setPosterGenerating(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(posterRef.current, {
        backgroundColor: '#0a0a0a',
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-4">无效的结果数据</h1>
        <p className="text-zinc-400 mb-8">请重新进行测试</p>
        <Link
          href="/sbti/test"
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
        >
          重新测试
        </Link>
      </div>
    );
  }

  const { finalType, badge, sub, modeKicker, levels, rawScores, special, secondaryType } = result;
  const imageUrl = TYPE_IMAGES[finalType.code];

  const levelColorClass: Record<string, string> = {
    L: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    M: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    H: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Poster area (for html2canvas capture) */}
      <div ref={posterRef} className="bg-[#0a0a0a]">
        {/* Hero result */}
        <section className="relative px-4 pt-12 pb-8 text-center overflow-hidden">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto animate-fade-in-up">
            <p className="text-xs text-emerald-500 font-medium mb-3 uppercase tracking-wider">
              {modeKicker}
            </p>

            {imageUrl && (
              <div className="mb-4 flex justify-center">
                <Image
                  src={imageUrl}
                  alt={finalType.code}
                  width={120}
                  height={120}
                  className="rounded-2xl"
                  unoptimized
                />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-black mb-2">
              <span className="gradient-text">{finalType.code}</span>
            </h1>
            <h2 className="text-2xl font-bold text-zinc-200 mb-3">{finalType.cn}</h2>

            <div className="inline-flex px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-300 mb-4">
              {badge}
            </div>

            <p className="text-sm text-zinc-400 mb-4">{sub}</p>

            <p className="text-base text-emerald-300 italic leading-relaxed">
              &ldquo;{finalType.intro}&rdquo;
            </p>
          </div>
        </section>

        {/* Description */}
        <section className="px-4 pb-8">
          <div className="max-w-lg mx-auto">
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <p className="text-sm text-zinc-300 leading-relaxed">{finalType.desc}</p>
            </div>
          </div>
        </section>

        {/* Secondary type for DRUNK */}
        {special && secondaryType && (
          <section className="px-4 pb-8">
            <div className="max-w-lg mx-auto">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs text-amber-400 mb-2">你的常规人格匹配</p>
                <p className="text-sm text-zinc-300">
                  <span className="font-bold text-amber-300">{secondaryType.code}</span>{' '}
                  {TYPE_LIBRARY_CN[secondaryType.code]} — 匹配度 {secondaryType.similarity}%
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Radar chart */}
        <section className="px-4 pb-8">
          <div className="max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-zinc-200 mb-4 text-center">15 维度画像</h3>
            <div className="flex justify-center">
              <RadarChart levels={levels} />
            </div>
          </div>
        </section>

        {/* Dimension details */}
        <section className="px-4 pb-8">
          <div className="max-w-lg mx-auto space-y-2">
            {dimensionOrder.map((dim) => {
              const level = levels[dim];
              const explanation = DIM_EXPLANATIONS[dim][level];
              const meta = dimensionMeta[dim];

              return (
                <div
                  key={dim}
                  className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-300">{meta.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-mono font-bold ${levelColorClass[level]}`}
                    >
                      {level} / {rawScores[dim]}分
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{explanation}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Watermark for poster */}
        <div className="px-4 pb-4 text-center">
          <p className="text-[10px] text-zinc-600">maaker.ai/sbti</p>
        </div>
      </div>

      {/* Action buttons (outside poster area) */}
      <section className="px-4 py-8 border-t border-zinc-800/50">
        <div className="max-w-lg mx-auto space-y-3">
          <button
            onClick={generatePoster}
            disabled={posterGenerating}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-2"
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
            className="w-full py-3 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            复制分享链接
          </button>

          <Link
            href="/sbti/test"
            className="w-full py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 font-medium transition-colors flex items-center justify-center gap-2"
          >
            重新测试
          </Link>

          <Link
            href="/sbti/types"
            className="w-full py-3 rounded-xl text-zinc-500 hover:text-zinc-400 font-medium transition-colors flex items-center justify-center gap-1 text-sm"
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-400">加载结果中...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
