import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./termref.css";

export const metadata: Metadata = {
  title: "Termref — Terminal Cheat Sheet Reference",
  description: "Curated terminal command cheat sheets for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
