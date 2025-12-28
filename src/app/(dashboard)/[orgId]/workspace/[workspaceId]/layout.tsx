import { Suspense } from "react";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { SidebarControlProvider } from "@/contexts/sidebar-control-context";
import { DocumentViewerProvider } from "@/contexts/document-viewer-context";
import { BaseLayout } from "@/components/layout/base-layout";

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
        <SidebarControlProvider>
          <DocumentViewerProvider>
            <BaseLayout>
              {children}
            </BaseLayout>
          </DocumentViewerProvider>
        </SidebarControlProvider>
      </WorkspaceProvider>
    </Suspense>
  );
}
