import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Treasury Council",
  description: "Multi-agent AI council for DAO treasury governance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark antialiased">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
