import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rent Management",
  description: "Private rent management app for Rajan and family",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
