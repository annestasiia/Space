import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IOSZoomFix from "./components/ui/IOSZoomFix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: "resizes-visual",
};

export const metadata: Metadata = {
  title: "space — urban routes",
  description: "Your personal urban route builder for any kind of movement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <body className="h-full overflow-hidden flex flex-col">
        <IOSZoomFix />
        {children}
      </body>
    </html>
  );
}
