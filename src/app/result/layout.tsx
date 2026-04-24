import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '测试结果',
  description: '查看你的 SBTI 人格测试结果 — 15个维度的详细分析。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
