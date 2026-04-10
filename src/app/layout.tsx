import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="zh-CN">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
