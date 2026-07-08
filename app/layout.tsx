import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vegas Injury Partners | Las Vegas Personal Injury Attorneys",
  description:
    "Free consultation, 24/7. Vegas Injury Partners represents people injured in car accidents, slip and falls, and other personal injury cases throughout Las Vegas and Clark County.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
