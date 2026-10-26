import type { Metadata, Viewport } from "next";
import { Barlow, Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-oswald", display: "swap" });
const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow", display: "swap" });

export const metadata: Metadata = {
  title: "Jan. Conf 2027 — 37th IMLC & IYLC",
  description: "International Ministers & Leadership Conference, 19–24 January 2027, Ibadan, Nigeria.",
};

export const viewport: Viewport = { themeColor: "#1460a1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
