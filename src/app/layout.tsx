import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAT HOUSE RESTAURANT - Tablette Menu & Kiosque",
  description: "Application Kiosque tactile pour tablettes de restaurant sur table - Mat House Restaurant",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
  themeColor: "#0b0d11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full w-full">
      <body className="h-full w-full overflow-hidden bg-slate-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
