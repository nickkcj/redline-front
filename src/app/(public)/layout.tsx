import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Vaultly",
  description: "Sign in or create an account to access Vaultly",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}