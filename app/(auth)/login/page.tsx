import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Check if there are any users in the database
  const userCount = await prisma.user.count();
  
  // If no users exist, redirect to setup
  if (userCount === 0) {
    redirect("/setup");
  }

  // If users exist, show the login form
  return <LoginForm />;
} 