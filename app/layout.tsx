import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "琥珀骰坊 · D&D 5E 骰子投掷器",
  description: "选择 D&D 5E 常用骰子，在紫色鎏金桌布上投掷琥珀骰，并清晰结算总点数。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
