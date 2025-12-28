"use client";

import * as React from "react";
import type { OrganizationWithWorkspaces, WorkspaceSummary } from "@/lib/api/services/organization.service";
import { useRouter } from "next/navigation";
import { useCurrentOrganization, useSetCurrentOrganization, useSetCurrentWorkspace, useUser } from "@/store/app-store";
import { organizationService } from "@/lib/api/services/organization.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/navigation/navbar";
import { useAuthContext } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Building, ArrowLeft, MoreVertical, Edit, Trash2, DoorOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useLeaveWorkspace, useDeleteWorkspace, useUpdateWorkspace, useCreateWorkspace, useOrganizations } from "@/hooks/api/use-organization";

export default function WorkspacesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentOrganization = useCurrentOrganization();
  const currentUser = useUser();
  const { user: authUser } = useAuthContext();
  const setCurrentOrganization = useSetCurrentOrganization();
  const setCurrentWorkspace = useSetCurrentWorkspace();

  const { organizations, loading: orgsLoading } = useOrganizations();

  // Get workspaces from current organization
  // Try to find by currentOrganization first, then by orgId from URL
  const currentOrgWithWorkspaces = React.useMemo(() => {
    if (currentOrganization) {
      const found = organizations.find((org: OrganizationWithWorkspaces) => org.id === currentOrganization.id);
      if (found) return found;
    }
    // Fallback: try to find by any organization in the list (should match currentOrganization)
    return organizations.find((org: OrganizationWithWorkspaces) => org.id === currentOrganization?.id) || null;
  }, [organizations, currentOrganization]);
  
  const workspaces: WorkspaceSummary[] = (currentOrgWithWorkspaces as OrganizationWithWorkspaces | null)?.workspaces ?? [];

  // New workspace modal state
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = React.useState(false);
  const [workspaceName, setWorkspaceName] = React.useState('');
  const [workspaceDescription, setWorkspaceDescription] = React.useState('');

  // Workspace operations hooks
  const { createWorkspace, creating, error: createError } = useCreateWorkspace();
  const { updateWorkspace, updating, error: updateError } = useUpdateWorkspace();
  const { deleteWorkspace, deleting, error: deleteError } = useDeleteWorkspace();
  const { leaveWorkspace, leaving, error: leaveError } = useLeaveWorkspace();

  // Edit workspace modal state
  const [showEditWorkspaceModal, setShowEditWorkspaceModal] = React.useState(false);
  const [editingWorkspace, setEditingWorkspace] = React.useState<WorkspaceSummary | null>(null);
  const [editWorkspaceName, setEditWorkspaceName] = React.useState('');
  const [editWorkspaceDescription, setEditWorkspaceDescription] = React.useState('');

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = React.useState<WorkspaceSummary | null>(null);

  // Leave workspace confirmation state
  const [showLeaveConfirmation, setShowLeaveConfirmation] = React.useState(false);
  const [leavingWorkspace, setLeavingWorkspace] = React.useState<WorkspaceSummary | null>(null);

  // Check if user can create workspaces
  const canCreateWorkspace = React.useMemo(() => {
    // Use authUser from context (same as organizations page)
    const userId = authUser?.id || currentUser?.id;
    if (!currentOrganization || !userId) {
      return false;
    }
    // Get full organization with workspaces to check owner/master
    const fullOrg = currentOrgWithWorkspaces as OrganizationWithWorkspaces | null;
    if (!fullOrg) {
      return false;
    }
    const isOwner = fullOrg.ownerId === userId;
    const isMaster = fullOrg.masterMemberId === userId;
    return isOwner || isMaster;
  }, [currentOrganization, authUser, currentUser, currentOrgWithWorkspaces]);

  const isLoading = orgsLoading || (organizations.length > 0 && !currentOrganization);

  const handleEnterWorkspace = (workspace: WorkspaceSummary) => {
    if (!currentOrganization?.id) {
      return;
    }

    // Create UserWorkspace object
    const userWorkspace = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      role: 'MEMBER' as const,
      organization: {
        id: currentOrganization.id,
        name: currentOrganization.name,
        description: currentOrganization.description,
      },
    };

    setCurrentWorkspace(userWorkspace);

    // Navigate to workspace using IDs
    router.push(`/org/${currentOrganization.id}/workspace/${workspace.id}`);
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim() || !currentOrganization?.id) {
      return;
    }

    try {
      await createWorkspace({
        name: workspaceName.trim(),
        description: workspaceDescription.trim() || undefined,
        organizationId: currentOrganization.id,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      setShowNewWorkspaceModal(false);
      setWorkspaceName('');
      setWorkspaceDescription('');

      toast.success(`Projeto "${workspaceName.trim()}" foi criado com sucesso!`);
    } catch (err) {
      console.error('Error creating workspace:', err);
      toast.error(createError || 'Erro ao criar projeto');
    }
  };

  const handleEditWorkspace = (workspace: WorkspaceSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkspace(workspace);
    setEditWorkspaceName(workspace.name);
    setEditWorkspaceDescription(workspace.description || '');
    setShowEditWorkspaceModal(true);
  };

  const handleUpdateWorkspace = async () => {
    if (!editingWorkspace || !editWorkspaceName.trim()) {
      return;
    }

    try {
      await updateWorkspace(editingWorkspace.id, {
        name: editWorkspaceName.trim(),
        description: editWorkspaceDescription.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      setShowEditWorkspaceModal(false);
      setEditingWorkspace(null);
      setEditWorkspaceName('');
      setEditWorkspaceDescription('');

      toast.success(`Projeto "${editWorkspaceName.trim()}" foi atualizado com sucesso!`);
    } catch (err) {
      console.error('Error updating workspace:', err);
      toast.error(updateError || 'Erro ao atualizar projeto');
    }
  };

  const handleDeleteWorkspace = (workspace: WorkspaceSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingWorkspace(workspace);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingWorkspace) return;

    try {
      await deleteWorkspace(deletingWorkspace.id);

      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      setShowDeleteConfirmation(false);
      setDeletingWorkspace(null);

      toast.success(`Projeto "${deletingWorkspace.name}" foi excluído com sucesso!`);
    } catch (err) {
      console.error('Error deleting workspace:', err);
      toast.error(deleteError || 'Erro ao excluir projeto');
    }
  };

  const handleLeaveWorkspace = (workspace: WorkspaceSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeavingWorkspace(workspace);
    setShowLeaveConfirmation(true);
  };

  const handleConfirmLeave = async () => {
    if (!leavingWorkspace) return;

    try {
      await leaveWorkspace(leavingWorkspace.id);

      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      setShowLeaveConfirmation(false);
      setLeavingWorkspace(null);

      toast.success(`Você saiu do projeto "${leavingWorkspace.name}" com sucesso!`);
    } catch (err) {
      console.error('Error leaving workspace:', err);
      toast.error(leaveError || 'Erro ao sair do projeto');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="@container/main flex flex-col gap-6 py-6">
            <div>
              <Skeleton className="h-9 w-64" />
            </div>
            <div className="space-y-3">
              <div>
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background video */}
      <video
        src="/mountain-vector-white.mp4"
        autoPlay
        muted
        loop
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/mountain-vector-white.mp4" type="video/mp4" />
      </video>
      {/* Overlay for opacity effect */}
      <div className="fixed inset-0 bg-background/90 z-10"></div>

      <div className="relative z-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="@container/main flex flex-col gap-6 py-6">
            {/* Back to Organizations Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/org')}
                className="gap-2 text-base cursor-pointer text-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-5" />
                <span>Voltar para Organizações</span>
              </Button>
              <div className="flex items-center gap-2">
                <Building className="size-5 text-foreground" />
                <span className="text-base font-medium text-foreground">
                  {currentOrganization?.name || 'Organização'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                    Projetos
                  </h1>
                  <p className="text-foreground mt-1 text-sm sm:text-base">
                    Gerencie seus projetos de trabalho
                  </p>
                </div>
                {canCreateWorkspace && (
                  <Button
                    onClick={() => setShowNewWorkspaceModal(true)}
                    className="w-full sm:w-auto transition-all cursor-pointer duration-200 hover:shadow-md bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="size-4 mr-2" />
                    <span className="sm:inline">Novo Projeto</span>
                  </Button>
                )}
              </div>

              {/* Workspaces Cards */}
              {workspaces.length === 0 && !isLoading ? (
                <p className="text-foreground font-medium">Nenhum projeto disponível.</p>
              ) : (
                <div className="flex flex-wrap gap-6">
                  {workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="bg-background border border-border rounded-xl p-6 cursor-pointer relative group w-full sm:w-[calc(50%-12px)] sm:min-w-[320px] sm:max-w-[480px] shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => handleEnterWorkspace(workspace)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-semibold text-foreground mb-2 break-words">
                            {workspace.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40 !bg-background !border-border">
                              {canCreateWorkspace && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => handleEditWorkspace(workspace, e)}
                                    className="text-foreground hover:bg-accent"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteWorkspace(workspace, e)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => handleLeaveWorkspace(workspace, e)}
                                className="text-orange-600 hover:bg-orange-50"
                              >
                                <DoorOpen className="mr-2 h-4 w-4" />
                                Sair
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground break-words">
                          {workspace.description || 'Sem descrição'}
                        </p>
                        {workspace.createdAt && (
                          <p className="text-sm text-muted-foreground font-medium">
                            Criado em {new Date(workspace.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Workspace Modal */}
        <Dialog open={showNewWorkspaceModal} onOpenChange={setShowNewWorkspaceModal}>
          <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">Novo Projeto</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Digite o nome do projeto"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-background text-foreground placeholder:text-muted-foreground"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="Digite uma descrição para o projeto"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                  maxLength={500}
                />
              </div>

              {createError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowNewWorkspaceModal(false)}
                  variant="outline"
                  size="default"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={!workspaceName?.trim() || creating}
                  size="default"
                >
                  {creating ? 'Criando...' : 'Criar Projeto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Workspace Modal */}
        <Dialog open={showEditWorkspaceModal} onOpenChange={setShowEditWorkspaceModal}>
          <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">Editar Projeto</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={editWorkspaceName}
                  onChange={(e) => setEditWorkspaceName(e.target.value)}
                  placeholder="Digite o nome do projeto"
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-background text-foreground placeholder:text-muted-foreground"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={editWorkspaceDescription}
                  onChange={(e) => setEditWorkspaceDescription(e.target.value)}
                  placeholder="Digite uma descrição para o projeto"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                  maxLength={500}
                />
              </div>

              {updateError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {updateError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowEditWorkspaceModal(false)}
                  variant="outline"
                  size="default"
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateWorkspace}
                  disabled={!editWorkspaceName?.trim() || updating}
                  size="default"
                  className="cursor-pointer"
                >
                  {updating ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">Excluir Projeto</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tem certeza que deseja excluir o projeto <strong className="font-semibold">&ldquo;{deletingWorkspace?.name}&rdquo;</strong>?
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Todo o conteúdo do projeto será excluído.
              </p>
              <p className="text-sm text-red-600 font-medium">
                Esta ação não pode ser desfeita.
              </p>

              {deleteError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowDeleteConfirmation(false)}
                  variant="outline"
                  size="default"
                  disabled={deleting}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  variant="destructive"
                  size="default"
                  disabled={deleting}
                  className="cursor-pointer"
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Leave Workspace Confirmation Modal */}
        <Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
          <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">Sair do Projeto</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tem certeza que deseja sair do projeto <strong className="font-semibold">&ldquo;{leavingWorkspace?.name}&rdquo;</strong>?
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Você perderá acesso a este projeto e precisará ser convidado novamente para retornar.
              </p>

              {leaveError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {leaveError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowLeaveConfirmation(false)}
                  variant="outline"
                  size="default"
                  disabled={leaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmLeave}
                  variant="destructive"
                  size="default"
                  disabled={leaving}
                >
                  {leaving ? 'Saindo...' : 'Sair do Projeto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

