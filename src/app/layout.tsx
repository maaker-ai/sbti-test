import type { Metadata } from 'next';
import MaakerBar from '@/components/MaakerBar';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://maaker.cn'),
  title: {
    default: 'SBTI 人格测试 — 发现你的隐藏人格',
    template: '%s | SBTI 人格测试',
  },
  description:
    '15个维度、26种人格、30道题 — 用最离谱的方式揭示你最真实的人格画像。SBTI 人格测试，比 MBTI 更有趣。',
  keywords: ['SBTI', 'SBTI测试', 'SBTI人格测试', '人格测试', '性格测试', 'MBTI替代', '人格类型', '心理测试'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://maaker.cn/sbti',
    siteName: 'SBTI 人格测试',
    title: 'SBTI 人格测试 — 发现你的隐藏人格',
    description: '15个维度、26种人格、30道题 — 你是拿捏者、小丑、还是……酒鬼？',
    images: [{ url: '/sbti/images/CTRL.png', width: 1024, height: 1024, alt: 'SBTI 人格测试' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBTI 人格测试 — 发现你的隐藏人格',
    description: '15个维度、26种人格、30道题 — 你是拿捏者、小丑、还是……酒鬼？',
    images: ['/sbti/images/CTRL.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://maaker.cn/sbti',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <script
          defer
          src="https://analytics.maaker.cn/script.js"
          data-website-id="da5ebb64-c418-44c2-baa8-0f0788549b41"
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <MaakerBar />
        {children}
      </body>
    </html>
  );
}
