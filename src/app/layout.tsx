import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL('https://turnproofs.com'),
  title: "TurnProofs — Turnovers Verified. Claims Defended.",
  description: "Bilingual cleaning checklists, timestamped photo evidence, GPS proof & dispute-ready audit reports for short-term rental hosts & property managers.",
  icons: {
    icon: [
      { url: '/icon.png?v=2', type: 'image/png' },
      { url: '/favicon.ico?v=2' }
    ],
    apple: '/apple-icon.png?v=2',
  },
  openGraph: {
    title: "TurnProofs — Turnovers Verified. Claims Defended.",
    description: "Bilingual cleaning checklists, timestamped photo evidence, GPS proof & dispute-ready audit reports for short-term rental hosts & property managers.",
    url: "https://turnproofs.com",
    siteName: "TurnProofs",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TurnProofs — Property Turnover Verification Software",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TurnProofs — Turnovers Verified. Claims Defended.",
    description: "Bilingual cleaning checklists, timestamped photo evidence, GPS proof & dispute-ready audit reports for short-term rental hosts & property managers.",
    images: ["/og-image.jpg"],
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
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
