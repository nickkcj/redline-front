"use client";

import * as React from "react";
import type { OrganizationWithWorkspaces } from "@/lib/api/services/organization.service";
import { useRouter } from "next/navigation";
import { useUser, useSetCurrentOrganization, useSetCurrentWorkspace } from "@/store/app-store";
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from "@/hooks/api/use-organization";
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
import { Plus, Building, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function OrganizationsListPage() {
  const router = useRouter();
  const currentUser = useUser();
  const { user: authUser } = useAuthContext();
  const setCurrentOrganization = useSetCurrentOrganization();
  const setCurrentWorkspace = useSetCurrentWorkspace();

  // State to track if component is mounted (client-side only) - MUST be before any conditional returns
  const [isMounted, setIsMounted] = React.useState(false);

  // State for scroll indicator
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Clear current organization and workspace when landing on this page
  React.useEffect(() => {
    setCurrentOrganization(null);
    setCurrentWorkspace(null);
  }, [setCurrentOrganization, setCurrentWorkspace]);

  // Set mounted state on client side only
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { organizations, loading: orgsLoading } = useOrganizations();

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Scaffold'

  // Modal states
  const [showNewOrgModal, setShowNewOrgModal] = React.useState(false);
  const [orgName, setOrgName] = React.useState('');
  const [orgDescription, setOrgDescription] = React.useState('');

  const [showEditOrgModal, setShowEditOrgModal] = React.useState(false);
  const [editingOrg, setEditingOrg] = React.useState<OrganizationWithWorkspaces | null>(null);
  const [editOrgName, setEditOrgName] = React.useState('');
  const [editOrgDescription, setEditOrgDescription] = React.useState('');

  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
  const [deletingOrg, setDeletingOrg] = React.useState<OrganizationWithWorkspaces | null>(null);

  // Organization operations hooks
  const { createOrganization, creating, error: createError } = useCreateOrganization();
  const { updateOrganization, updating, error: updateError } = useUpdateOrganization();
  const { deleteOrganization, deleting, error: deleteError } = useDeleteOrganization();

  const isLoading = orgsLoading;

  // Function to get the display name for the user
  const getDisplayName = () => {
    let name = null;

    if (currentUser?.name) {
      name = currentUser.name;
    } else if (authUser) {
      if (authUser.name) {
        name = authUser.name;
      } else if (authUser.email) {
        name = authUser.email.split('@')[0];
      }
    }

    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    return null;
  };

  const displayName = getDisplayName();

  // Handle scroll to show/hide scroll indicator
  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 10;

    setShowScrollIndicator(!isAtBottom);
  }, []);

  // Add scroll listener
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, organizations.length]);

  const handleEnterOrganization = (org: OrganizationWithWorkspaces) => {
    setCurrentWorkspace(null);
    setCurrentOrganization(org);
    router.push(`/org/${org.id}`);
  };

  const canCreate = orgName.trim().length > 0;

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      toast.error('O nome é obrigatório.');
      return;
    }

    try {
      const newOrg = await createOrganization({
        name: orgName.trim(),
        description: orgDescription.trim() || undefined,
      });

      // Close modal and reset form
      setShowNewOrgModal(false);
      setOrgName('');
      setOrgDescription('');

      toast.success(`Organização "${newOrg.name}" foi criada com sucesso!`);
    } catch (err) {
      console.error('Error creating organization:', err);
      toast.error(createError || 'Erro ao criar organização');
    }
  };

  const handleEditOrganization = (org: OrganizationWithWorkspaces, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOrg(org);
    setEditOrgName(org.name);
    setEditOrgDescription(org.description || '');
    setShowEditOrgModal(true);
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrg || !editOrgName.trim()) {
      return;
    }

    try {
      const updatedOrg = await updateOrganization(editingOrg.id, {
        name: editOrgName.trim(),
        description: editOrgDescription.trim() || undefined,
      });

      // Close modal and reset form
      setShowEditOrgModal(false);
      setEditingOrg(null);
      setEditOrgName('');
      setEditOrgDescription('');

      toast.success(`Organização "${updatedOrg.name}" foi atualizada com sucesso!`);
    } catch (err) {
      console.error('Error updating organization:', err);
      toast.error(updateError || 'Erro ao atualizar organização');
    }
  };

  const handleDeleteOrganization = (org: OrganizationWithWorkspaces, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingOrg(org);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrg) return;

    try {
      await deleteOrganization(deletingOrg.id);

      // Close confirmation and reset state
      setShowDeleteConfirmation(false);
      setDeletingOrg(null);

      toast.success(`Organização "${deletingOrg.name}" foi excluída com sucesso!`);
    } catch (err) {
      console.error('Error deleting organization:', err);
      toast.error(deleteError || 'Erro ao excluir organização');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white relative">
        {/* Background video - only render on client to avoid hydration mismatch */}
        {isMounted && (
          <>
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
            <div className="fixed inset-0 bg-white/80 z-10"></div>
          </>
        )}
        <div className="relative z-20">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="@container/main flex flex-col gap-6 py-6">
              <div>
                <Skeleton className="h-9 w-64 bg-gray-200/60" />
              </div>
              <div className="space-y-6 mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-40 bg-gray-200/60" />
                      <Skeleton className="h-6 w-8 rounded-full bg-gray-200/60" />
                    </div>
                    <Skeleton className="h-5 w-64 mt-2 bg-gray-200/60" />
                  </div>
                  <Skeleton className="h-10 w-48 bg-gray-200/60" />
                </div>
                <div className="flex flex-wrap gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/80 border border-gray-200 rounded-xl p-6 w-full sm:w-[calc(50%-12px)] sm:min-w-[320px] sm:max-w-[480px] shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24 bg-gray-200/60" />
                            <Skeleton className="h-7 w-32 bg-gray-200/60" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full bg-gray-200/60" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full bg-gray-200/60" />
                          <Skeleton className="h-4 w-3/4 bg-gray-200/60" />
                          <Skeleton className="h-4 w-1/2 bg-gray-200/60" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background video - only render on client to avoid hydration mismatch */}
      {isMounted && (
        <>
          <video
            src="/mountain-vector-white.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="fixed inset-0 w-full h-full object-cover z-0"
          >
            <source src="/mountain-vector-white.mp4" type="video/mp4" />
          </video>
          {/* Overlay for opacity effect */}
          <div className="fixed inset-0 bg-white/80 z-10"></div>
        </>
      )}

      <div className="relative z-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="@container/main flex flex-col gap-6 py-6 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                {`Bem-vindo${displayName ? ` ao ${appName}, ${displayName}!` : ` ao ${appName}!`}`}
              </h1>
            </div>

            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                      Organizações
                    </h2>
                    <Badge variant="secondary" className="text-sm font-medium bg-gray-100 text-gray-700 border-gray-200">
                      {organizations.length}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1.5 text-sm sm:text-base">
                    Gerencie suas organizações e acesse seus projetos
                  </p>
                </div>
                <Button
                  onClick={() => setShowNewOrgModal(true)}
                  className="w-full sm:w-auto transition-all cursor-pointer duration-200 hover:shadow-lg hover:scale-[1.02] bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
                >
                  <Plus className="size-4 mr-2" />
                  <span className="sm:inline">Nova Organização</span>
                </Button>
              </div>

              {/* Organizations Cards */}
              {organizations.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="bg-white/90 border border-gray-200 rounded-xl p-8 text-center max-w-md">
                    <Building className="size-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-base font-medium mb-2">Nenhuma organização disponível</p>
                    <p className="text-gray-500 text-sm mb-6">Crie sua primeira organização para começar</p>
                    <Button
                      onClick={() => setShowNewOrgModal(true)}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Plus className="size-4 mr-2" />
                      Criar Organização
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div
                    ref={scrollContainerRef}
                    className="flex flex-wrap gap-6 max-h-[calc(100vh-300px)] overflow-y-auto pb-8 pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                  >
                    {organizations.map((org: OrganizationWithWorkspaces) => {
                      const workspaceCount = org.workspaces?.length || 0;

                      return (
                        <div
                          key={org.id}
                          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 cursor-pointer relative group w-full sm:w-[calc(50%-12px)] sm:min-w-[320px] sm:max-w-[480px] shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5"
                          onClick={() => handleEnterOrganization(org)}
                        >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                              <Building className="size-3.5" />
                              <span>Organização</span>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2 break-words group-hover:text-gray-700 transition-colors">
                              {org.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Show owner/member badge */}
                            {org.ownerId === authUser?.id ? (
                              <Badge variant="default" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
                                Proprietário
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 font-medium">
                                Membro
                              </Badge>
                            )}
                            {/* Only show edit/delete options if user is the owner */}
                            {org.ownerId === authUser?.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-40">
                                  <DropdownMenuItem
                                    onClick={(e) => handleEditOrganization(org, e)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteOrganization(org, e)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="space-y-1.5 mt-4">
                          <p className="text-sm text-gray-600 break-words line-clamp-2">
                            {org.description || <span className="text-gray-400 italic">Sem descrição</span>}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 pt-1">
                            <span className="font-medium">{workspaceCount} projeto{workspaceCount !== 1 ? 's' : ''}</span>
                            {org.createdAt && (
                              <span className="text-xs">
                                Criada em {new Date(org.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                  {/* Scroll indicator - shows when there are more cards below */}
                  {organizations.length > 4 && (
                    <div className={`absolute bottom-2 left-0 right-0 pointer-events-none flex items-end justify-center transition-opacity duration-300 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="text-xs text-gray-600 flex items-center gap-1.5 animate-bounce bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 font-medium">
                        <span>↓</span>
                        <span>Role para ver mais</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Organization Modal */}
        <Dialog open={showNewOrgModal} onOpenChange={setShowNewOrgModal}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Nova Organização</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Organização <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Digite o nome da organização"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder="Digite uma descrição para a organização"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none transition-all"
                  maxLength={500}
                />
              </div>

              {createError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={() => setShowNewOrgModal(false)}
                  variant="outline"
                  size="default"
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateOrganization}
                  disabled={!canCreate || creating}
                  size="default"
                  className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {creating ? 'Criando...' : 'Criar Organização'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Organization Modal */}
        <Dialog open={showEditOrgModal} onOpenChange={setShowEditOrgModal}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Editar Organização</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Organização
                </label>
                <input
                  type="text"
                  value={editOrgName}
                  onChange={(e) => setEditOrgName(e.target.value)}
                  placeholder="Digite o nome da organização"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={editOrgDescription}
                  onChange={(e) => setEditOrgDescription(e.target.value)}
                  placeholder="Digite uma descrição para a organização"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none transition-all"
                  maxLength={500}
                />
              </div>

              {updateError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {updateError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={() => setShowEditOrgModal(false)}
                  variant="outline"
                  size="default"
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateOrganization}
                  disabled={!editOrgName?.trim() || updating}
                  size="default"
                  className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {updating ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Excluir Organização</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Tem certeza que deseja excluir a organização <strong className="font-semibold">&ldquo;{deletingOrg?.name}&rdquo;</strong>?
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Todos os workspaces e conteúdos da organização serão excluídos.
              </p>
              <p className="text-sm text-red-600 font-medium">
                Esta ação não pode ser desfeita.
              </p>

              {deleteError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
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
      </div>
    </div>
  );
}
