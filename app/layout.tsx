import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";

export const metadata: Metadata = {
  title: "Beatora — AI Music & Beat Sound Portal",
  description: "Next-gen music player portal with beat-reactive visualizer and admin song studio",
  icons: {
    icon: "/Neon Beatora Headphone Logo.png",
    apple: "/Neon Beatora Headphone Logo.png",
  },
  openGraph: {
    title: "Beatora — AI Music Portal",
    description: "Installable music player portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beatora — AI Music Portal",
    description: "Installable music player portal",
  },
  other: {
    "theme-color": "#09090b",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black",
    "apple-mobile-web-app-title": "Beatora",
    "msapplication-TileColor": "#09090b",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AudioProvider>{children}</AudioProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then((reg) => {
                  console.log('[PWA] ServiceWorker registered:', reg.scope);
                }).catch((err) => {
                  console.error('[PWA] ServiceWorker registration failed:', err);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
