import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "琥珀骰坊 · D&D 5E 骰子投掷器";
const description = "适配手机竖屏的 D&D 5E 琥珀骰子投掷器，支持全部常用骰型与清晰总点数结算。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "amber-dice-forge.z4cgm7sb92.chatgpt.site";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: imageUrl, width: 900, height: 600, alt: "紫金桌布上的琥珀 D&D 骰子" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
