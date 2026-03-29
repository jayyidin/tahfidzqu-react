import type { Metadata } from "next";
import { Inter, Merriweather, Amiri, Katibeh } from "next/font/google";
import "./globals.css"; // Global styles

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const merriweather = Merriweather({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-arabic",
});

const katibeh = Katibeh({
  weight: ["400"],
  subsets: ["arabic"],
  variable: "--font-katibeh",
});

export const metadata: Metadata = {
  title: "TahfidzQu",
  description: "Madrasah Tahfidz Quran",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} ${amiri.variable} ${katibeh.variable} font-sans bg-slate-50 text-slate-800 dark:bg-[#0a120f] dark:text-gray-200 flex flex-col w-full h-full transition-colors duration-300 antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
