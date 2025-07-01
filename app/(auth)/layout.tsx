import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "RentManager - Authentication",
  description: "Sign in to your RentManager account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
          {children}
        </div>
  );
} 