import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIRU — The Fold",
  description: "The world sees what you choose to see. A real-time multiplayer experience about bias, belonging, and the courage to accept what is different.",
  openGraph: {
    title: "MIRU — The Fold",
    description: "He was never the problem. He was the answer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="grain">{children}</body>
    </html>
  );
}
