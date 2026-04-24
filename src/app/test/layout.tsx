import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
