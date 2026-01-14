import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trinixjournal.com"),
  title: {
    default: "Advance Ancient Knowledge and Wisdom Journal",
    template: "%s | Advance Ancient Knowledge and Wisdom Journal",
  },
  description:
    "A peer-reviewed journal by Trinix Pvt Ltd focused on engineering, AI/ML, materials, sustainability, and technology innovation.",
  openGraph: {
    title: "Advance Ancient Knowledge and Wisdom Journal",
    description:
      "Peer-reviewed research across engineering, AI/ML, materials, sustainability, and tech innovation.",
    type: "website",
    url: "https://trinixjournal.com",
    siteName: "Trinix Journal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advance Ancient Knowledge and Wisdom Journal",
    description:
      "Peer-reviewed research across engineering, AI/ML, materials, sustainability, and tech innovation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
