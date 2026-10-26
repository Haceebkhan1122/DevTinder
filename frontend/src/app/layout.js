import { Suspense } from "react";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "devTinder – Find your next dev partner",
    template: "%s · devTinder",
  },
  description: "Swipe through developers, match on skills and build things together.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <Suspense fallback={<div className="h-16 border-b border-line/70" />}>
            <Navbar />
          </Suspense>
          <main className="flex flex-1 flex-col pb-20 md:pb-0">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
