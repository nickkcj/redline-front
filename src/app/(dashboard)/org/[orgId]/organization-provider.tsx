"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useOrganizations } from "@/hooks/api/use-organization";
import type { OrganizationWithWorkspaces } from "@/lib/api/services/organization.service";

interface OrganizationProviderProps {
  children: React.ReactNode;
  orgId: string;
}

export function OrganizationProvider({ children, orgId }: OrganizationProviderProps) {
  const router = useRouter();
  const { organizations, loading } = useOrganizations();
  const { setCurrentOrganization, currentOrganization } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  // Garantir que o componente está montado no cliente para evitar hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (loading || !isMounted) {
      return;
    }

    // Find organization by ID
    const org = organizations.find((o: OrganizationWithWorkspaces) => o.id === orgId);
    
    if (!org) {
      // Only redirect if we're sure data is loaded and org doesn't exist
      if (!loading && organizations.length > 0) {
        router.replace('/org');
      }
      return;
    }

    // Set current organization if different
    if (!currentOrganization || currentOrganization.id !== org.id) {
      setCurrentOrganization(org);
    }
  }, [orgId, organizations, loading, currentOrganization, setCurrentOrganization, router, isMounted]);

  // Não renderizar nada até estar montado no cliente
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-border border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando organização...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-border border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando organização...</p>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Organização não encontrada</p>
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

