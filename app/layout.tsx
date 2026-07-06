import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";



export const metadata: Metadata = {
  title: "RentManager - Property Management System",
  description: "Comprehensive property management system for rental properties",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className="antialiased"
      >
        <Providers>
          <Toaster richColors position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
