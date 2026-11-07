import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";

export const metadata: Metadata = {
  title: "Beatora — AI Music & Beat Sound Portal",
  description: "Next-gen music player portal with beat-reactive visualizer and admin song studio",
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
      </body>
    </html>
  );
}
