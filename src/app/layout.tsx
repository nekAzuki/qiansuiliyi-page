import type { Metadata } from 'next';
import { Noto_Sans_SC } from 'next/font/google';
import './globals.css';

export const runtime = 'edge';

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
});

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
    <html lang="zh-CN" className={notoSansSC.variable}>
      <body className={`${notoSansSC.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
