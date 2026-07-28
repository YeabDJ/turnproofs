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

export const metadata: Metadata = {
  title: "TurnProofs — Dispute-Proof Cleaning Verification & Auditing",
  description: "GPS-timestamped photo verification, 0-app mobile cleaner terminal, and automated PDF audit certificates for Airbnb hosts and commercial property managers.",
  icons: {
    icon: [
      { url: '/icon.png?v=2', type: 'image/png' },
      { url: '/favicon.ico?v=2' }
    ],
    apple: '/apple-icon.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
