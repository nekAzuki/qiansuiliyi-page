import type { Metadata } from 'next';
import BackgroundSwitcher from '@/components/ui/BackgroundSwitcher';
import './globals.css';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: '千穗梨衣的歌单',
  description: '千穗梨衣_lily 的B站直播歌曲目录，在这里查找她唱过的所有歌曲。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>
        <BackgroundSwitcher>
          {children}
        </BackgroundSwitcher>
      </body>
    </html>
  );
}
