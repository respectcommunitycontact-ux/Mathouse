import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaProvider } from "@/components/PwaProvider";

export const metadata: Metadata = {
  title: "MAT HOUSE RESTAURANT - Tablette Menu & Kiosque",
  description: "Application Kiosque tactile pour tablettes de restaurant sur table - Mat House Restaurant",
  manifest: "/manifest.json",
  applicationName: "Mat House",
  icons: {
    icon: [
      { url: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mat House",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B0E14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full w-full">
      <body className="h-full w-full overflow-hidden bg-slate-950 font-sans antialiased">
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
