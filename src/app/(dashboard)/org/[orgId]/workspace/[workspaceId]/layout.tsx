import { Suspense } from "react";
import { WorkspaceProvider } from "./workspace-provider";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    orgId: string;
    workspaceId: string;
  }>;
}

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  const { orgId, workspaceId } = await params;

  return (
    <Suspense fallback={null}>
      <WorkspaceProvider orgId={orgId} workspaceId={workspaceId}>
        {children}
      </WorkspaceProvider>
    </Suspense>
  );
}
