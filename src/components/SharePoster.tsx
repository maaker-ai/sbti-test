'use client';

import { forwardRef, useState, useEffect } from 'react';
import type { Level } from '@/data/scoring';
import type { PersonalityType, PersonalityTheme } from '@/data/types';
import { DEFAULT_THEME } from '@/data/types';

interface SharePosterProps {
  finalType: PersonalityType;
  badge: string;
  levels: Record<string, Level>;
  rawScores: Record<string, number>;
  imageUrl?: string;
  theme?: PersonalityTheme;
  shareUrl?: string;
}

/**
 * Share poster — optimized for social media (WeChat Moments, Xiaohongshu).
 * Design philosophy: identity > data. Big character, big quote, no charts.
 * Fixed 440x780, all inline styles to avoid Tailwind oklab issues with html-to-image.
 */
const SharePoster = forwardRef<HTMLDivElement, SharePosterProps>(
  ({ finalType, badge, imageUrl, theme: themeProp, shareUrl }, ref) => {
    const theme = themeProp ?? finalType.theme ?? DEFAULT_THEME;
    // html-to-image needs absolute URL for images
    const absImageUrl = imageUrl && typeof window !== 'undefined'
      ? new URL(imageUrl, window.location.origin).href
      : imageUrl;
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

    useEffect(() => {
      const base = shareUrl || 'https://maaker.cn/sbti';
      const qrTarget = base + (base.includes('?') ? '&' : '?') + 'from=share';
      import('qrcode').then((QRCode) => {
        QRCode.toDataURL(qrTarget, {
          width: 80,
          margin: 1,
          color: { dark: '#E2E8F0', light: '#00000000' },
          errorCorrectionLevel: 'M',
        }).then(setQrDataUrl);
      });
    }, [shareUrl]);

    return (
      <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      <div
        ref={ref}
        style={{
          width: 480,
          height: 800,
          background: `linear-gradient(180deg, #0F0F23 0%, #110E2A 40%, #0F0F23 100%)`,
          fontFamily: "'Poppins', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          color: '#E2E8F0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Background glow — character-themed */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 360,
            height: 360,
            background: `radial-gradient(circle, ${theme.glow.replace('0.12', '0.18')} 0%, transparent 65%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Secondary bottom glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 300,
            height: 200,
            background: `radial-gradient(circle, ${theme.glow.replace('0.12', '0.08')} 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Top label */}
        <div
          style={{
            marginTop: 36,
            fontSize: 10,
            letterSpacing: 4,
            color: theme.accent,
            textTransform: 'uppercase',
            fontWeight: 600,
            opacity: 0.8,
            position: 'relative',
          }}
        >
          SBTI 人格测试
        </div>

        {/* Character image — the visual hero */}
        {absImageUrl && (
          <div style={{ marginTop: 24, position: 'relative' }}>
            {/* Glow ring behind image */}
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: -12,
                width: 224,
                height: 224,
                borderRadius: 28,
                background: `linear-gradient(135deg, ${theme.gradientFrom}33, ${theme.gradientTo}33)`,
                filter: 'blur(20px)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={absImageUrl}
              alt={finalType.code}
              width={200}
              height={200}
              style={{
                borderRadius: 24,
                position: 'relative',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Type code — big, gradient, unmissable */}
        <div
          style={{
            marginTop: absImageUrl ? 24 : 60,
            fontSize: 56,
            fontWeight: 900,
            fontFamily: "'Righteous', 'Poppins', sans-serif",
            background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
            position: 'relative',
          }}
        >
          {finalType.code}
        </div>

        {/* Chinese name */}
        <div
          style={{
            marginTop: 4,
            fontSize: 24,
            fontWeight: 700,
            fontFamily: "'Righteous', 'Poppins', sans-serif",
            color: '#E2E8F0',
            position: 'relative',
          }}
        >
          {finalType.cn}
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: 16,
            padding: '5px 12px',
            borderRadius: 20,
            background: `${theme.accent}15`,
            border: `1px solid ${theme.accent}40`,
            fontSize: 11,
            color: theme.accent,
            fontWeight: 500,
            position: 'relative',
            whiteSpace: 'nowrap',
          }}
        >
          {badge}
        </div>

        {/* Intro quote — the emotional hook, the reason people share */}
        <div
          style={{
            marginTop: 28,
            padding: '0 40px',
            fontSize: 16,
            color: '#E2E8F0',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: 1.8,
            fontWeight: 400,
            position: 'relative',
            opacity: 0.9,
          }}
        >
          <span style={{ color: `${theme.accent}99`, fontSize: 24, fontFamily: 'Georgia, serif' }}>&ldquo;</span>
          {finalType.intro}
          <span style={{ color: `${theme.accent}99`, fontSize: 24, fontFamily: 'Georgia, serif' }}>&rdquo;</span>
        </div>

        {/* Description excerpt — gives the poster substance */}
        <div
          style={{
            marginTop: 20,
            padding: '0 30px',
            fontSize: 11.5,
            color: '#94A3B8',
            textAlign: 'center',
            lineHeight: 1.9,
            position: 'relative',
          }}
        >
          {finalType.desc.length > 150 ? finalType.desc.slice(0, 150) + '......' : finalType.desc}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Divider line */}
        <div
          style={{
            width: 60,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.accent}40, transparent)`,
            marginBottom: 20,
          }}
        />

        {/* Footer CTA with QR code */}
        <div
          style={{
            paddingBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            position: 'relative',
          }}
        >
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR" width={64} height={64} style={{ borderRadius: 6 }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontSize: 11, color: '#64748B', letterSpacing: 0.5 }}>
              扫码测测你的人格
            </div>
            <div style={{ fontSize: 13, color: theme.accent, fontWeight: 700, letterSpacing: 1 }}>
              maaker.cn/sbti
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }
);

SharePoster.displayName = 'SharePoster';

export default SharePoster;
