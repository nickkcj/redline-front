import { Suspense } from "react";
import { OrganizationProvider } from "@/components/providers/organization-provider";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgId } = await params;

  return (
    <Suspense fallback={null}>
      <OrganizationProvider orgId={orgId}>
        <DashboardWrapper>
          {children}
        </DashboardWrapper>
      </OrganizationProvider>
    </Suspense>
  );
}

