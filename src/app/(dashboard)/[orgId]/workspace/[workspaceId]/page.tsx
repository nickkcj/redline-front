"use client";

import * as React from "react";
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header";
import { HomeView } from "@/components/workspace/views/home-view";
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store";

export default function WorkspacePage() {
  const currentOrganization = useCurrentOrganization();
  const currentWorkspace = useCurrentWorkspace();

  const breadcrumbs = [
    { label: currentOrganization?.name || 'Organização', href: '/' },
    { label: currentWorkspace?.name || 'Workspace' },
    { label: 'Dashboard' },
  ];

  return (
    <div className="h-full flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} />
      <div className="flex-1 min-h-0">
        <HomeView />
      </div>
    </div>
  );
}
