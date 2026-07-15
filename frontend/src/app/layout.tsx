import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Log App",
  description: "学習内容と実装過程を記録するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
