import type { Metadata } from "next";
import "./globals.css";
import "./termref.css";

export const metadata: Metadata = {
  title: "Termref — Terminal Cheat Sheet Generator",
  description: "AI-powered terminal command cheat sheet generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
