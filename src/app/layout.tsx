import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const fontSans = localFont({
  src: [
    {
      path: "../assets/fonts/CalSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Pagen - AI Page Generator",
  description: "Generate professional-looking SaaS style webpages using AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
