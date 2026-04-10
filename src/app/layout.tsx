import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SBTI 人格测试 | 发现你的隐藏人格',
    template: '%s | SBTI 人格测试',
  },
  description:
    'SBTI 人格测试 — 15个维度、26种人格，用30道题揭示你真实的人格画像。来看看你是拿捏者、小丑、还是……酒鬼？',
  keywords: ['SBTI', '人格测试', '性格测试', '心理测试', '人格类型'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
