import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.tsx
export const metadata = {
  title: 'YouTube サムネ作成ツール',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <script
          src="https://use.typekit.net/yju5vnt.js"
          async
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{Typekit.load({ async: true });}catch(e){}`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

