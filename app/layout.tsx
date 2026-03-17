import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "柚子AI - 聚合工作台",
  description: "AI 大模型聚合平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
