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
    default: "Trinix Journal of Advanced Engineering and Sciences",
    template: "%s | Trinix Journal of Advanced Engineering and Sciences",
  },
  description:
    "A peer-reviewed journal by Trinix Pvt Ltd focused on engineering, AI/ML, materials, sustainability, and technology innovation.",
  openGraph: {
    title: "Trinix Journal of Advanced Engineering and Sciences",
    description:
      "Peer-reviewed research across engineering, AI/ML, materials, sustainability, and tech innovation.",
    type: "website",
    url: "https://trinixjournal.com",
    siteName: "Trinix Journal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trinix Journal of Advanced Engineering and Sciences",
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
