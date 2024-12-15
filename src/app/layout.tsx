import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const inter = localFont({
  src: "../assets/fonts/Inter-Regular.woff2",
  variable: "--font-inter",
});
const fontHeading = localFont({
  src: "../assets/fonts/Inter-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Pagen - AI Page Generator",
  description: "Generate professional-looking SaaS style webpages using AI",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any"
      },
      {
        url: "/images/logo.svg",
        type: "image/svg+xml"
      }
    ]
  }
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
          inter.variable,
          fontHeading.variable
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
