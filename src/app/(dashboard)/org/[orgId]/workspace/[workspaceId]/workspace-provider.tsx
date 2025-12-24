"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useOrganizations } from "@/hooks/api/use-organization";
import type { OrganizationWithWorkspaces } from "@/lib/api/services/organization.service";

interface WorkspaceProviderProps {
  children: React.ReactNode;
  orgId: string;
  workspaceId: string;
}

export function WorkspaceProvider({ children, orgId, workspaceId }: WorkspaceProviderProps) {
  const router = useRouter();
  const { organizations, loading } = useOrganizations();
  const { setCurrentOrganization, setCurrentWorkspace, currentOrganization, currentWorkspace } = useAppStore();

  useEffect(() => {
    if (loading) {
      return;
    }

    // Find organization by ID
    const org = organizations.find((o: OrganizationWithWorkspaces) => o.id === orgId) as OrganizationWithWorkspaces | undefined;

    if (!org) {
      if (!loading && organizations.length > 0) {
        router.replace('/org');
      }
      return;
    }

    // Set current organization if different
    if (!currentOrganization || currentOrganization.id !== org.id) {
      setCurrentOrganization(org);
    }

    // Find workspace in organization
    const workspace = org.workspaces?.find(w => w.id === workspaceId);

    if (!workspace) {
      if (!loading) {
        router.replace(`/org/${orgId}`);
      }
      return;
    }

    // Create UserWorkspace object
    const userWorkspace = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      role: 'MEMBER' as const,
      organization: {
        id: org.id,
        name: org.name,
        description: org.description,
      },
    };

    // Set current workspace if different
    if (!currentWorkspace || currentWorkspace.id !== workspace.id) {
      setCurrentWorkspace(userWorkspace);
    }
  }, [orgId, workspaceId, organizations, loading, currentOrganization, currentWorkspace, setCurrentOrganization, setCurrentWorkspace, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!currentOrganization || !currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Projeto não encontrado</p>
          <button
            onClick={() => router.push('/org')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Voltar para organizações
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
