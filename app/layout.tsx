import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beatora — Every Beat. Every Moment.",
  description: "Stream, discover and feel the music.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}