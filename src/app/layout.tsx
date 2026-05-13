import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/auth";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Concertina HR | Time & Leave Management",
  description: "Internal portal for employee time tracking and leave approvals.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased flex`}>
        {isLoggedIn ? (
          <AppShell user={session?.user}>
            {children}
          </AppShell>
        ) : (
          <main className="flex-1 w-full flex flex-col min-h-screen">
            {children}
          </main>
        )}
        <Analytics />
      </body>
    </html>
  );
}
