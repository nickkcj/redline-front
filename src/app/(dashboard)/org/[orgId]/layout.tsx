import { Suspense } from "react";
import { OrganizationProvider } from "./organization-provider";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgId } = await params;
  
  return (
    <Suspense fallback={null}>
      <OrganizationProvider orgId={orgId}>
        {children}
      </OrganizationProvider>
    </Suspense>
  );
}

