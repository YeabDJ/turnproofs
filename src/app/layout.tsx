import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  title: "TurnProofs — One Scan. Proof Forever.",
  description: "Turnover verification without the app friction. GPS proof, photo evidence, and audit-ready PDFs—before the next check-in.",
  icons: {
    icon: [
      { url: '/icon.png?v=2', type: 'image/png' },
      { url: '/favicon.ico?v=2' }
    ],
    apple: '/apple-icon.png?v=2',
  },
  openGraph: {
    title: "TurnProofs — One Scan. Proof Forever.",
    description: "Turnover verification without the app friction. GPS proof, photo evidence, and audit-ready PDFs—before the next check-in.",
    url: "https://turnproofs.com",
    siteName: "TurnProofs",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TurnProofs — One Scan. Proof Forever.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TurnProofs — One Scan. Proof Forever.",
    description: "Turnover verification without the app friction. GPS proof, photo evidence, and audit-ready PDFs—before the next check-in.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
