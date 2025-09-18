"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MagnifyingGlass, Folders, Files, Users, Calendar, DotsThreeVertical, Trash, Archive, PencilSimple } from "@phosphor-icons/react";
import { toast } from "sonner";

const dataRooms = [
  {
    id: "1",
    name: "Projeto Alpha",
    description: "Due diligence para aquisição da empresa Alpha",
    documentsCount: 23,
    accessesCount: 156,
    status: "active",
    createdAt: "2024-01-15",
    lastActivity: "2 horas atrás"
  },
  {
    id: "2",
    name: "Projeto Beta",
    description: "Documentação técnica e financeira para fusão",
    documentsCount: 18,
    accessesCount: 89,
    status: "active",
    createdAt: "2024-01-10",
    lastActivity: "1 dia atrás"
  },
  {
    id: "3",
    name: "Due Diligence Q1",
    description: "Revisão trimestral de conformidade",
    documentsCount: 41,
    accessesCount: 234,
    status: "archived",
    createdAt: "2023-12-01",
    lastActivity: "2 semanas atrás"
  },
  {
    id: "4",
    name: "Projeto Gamma",
    description: "Avaliação de parceria estratégica",
    documentsCount: 12,
    accessesCount: 67,
    status: "draft",
    createdAt: "2024-01-20",
    lastActivity: "3 dias atrás"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="default">Ativo</Badge>;
    case "archived":
      return <Badge variant="secondary">Arquivado</Badge>;
    case "draft":
      return <Badge variant="outline">Rascunho</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function RoomsPage() {
  const [roomList, setRoomList] = useState(dataRooms);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; room: typeof dataRooms[0] | null }>({
    open: false,
    room: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; room: typeof dataRooms[0] | null }>({
    open: false,
    room: null,
  });

  // Form states for create/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft"
  });

  const handleCreateRoom = () => {
    const newRoom = {
      id: String(Date.now()),
      name: formData.name,
      description: formData.description,
      documentsCount: 0,
      accessesCount: 0,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: "Agora"
    };
    setRoomList(prev => [newRoom, ...prev]);
    toast.success(`Data room "${formData.name}" criado com sucesso`);
    setCreateDialogOpen(false);
    setFormData({ name: "", description: "", status: "draft" });
  };

  const handleEditRoom = (room: typeof dataRooms[0]) => {
    setFormData({
      name: room.name,
      description: room.description,
      status: room.status
    });
    setEditDialog({ open: true, room });
  };

  const confirmEdit = () => {
    if (editDialog.room) {
      setRoomList(prev => prev.map(room =>
        room.id === editDialog.room?.id
          ? { ...room, name: formData.name, description: formData.description, status: formData.status }
          : room
      ));
      toast.success(`Data room "${formData.name}" atualizado com sucesso`);
      setEditDialog({ open: false, room: null });
      setFormData({ name: "", description: "", status: "draft" });
    }
  };

  const handleDeleteRoom = (room: typeof dataRooms[0]) => {
    setDeleteDialog({ open: true, room });
  };

  const confirmDelete = () => {
    if (deleteDialog.room) {
      setRoomList(prev => prev.filter(room => room.id !== deleteDialog.room?.id));
      toast.success(`Data room "${deleteDialog.room.name}" excluído com sucesso`);
      setDeleteDialog({ open: false, room: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Rooms</h1>
          <p className="text-muted-foreground">
            Gerencie seus data rooms e documentos
          </p>
        </div>
        <Button onClick={() => {
          setFormData({ name: "", description: "", status: "draft" });
          setCreateDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Data Room
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar data rooms..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roomList.map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folders className="h-5 w-5" />
                  {room.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(room.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <DotsThreeVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          handleEditRoom(room);
                        }}
                      >
                        <PencilSimple className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" />
                        Arquivar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                          e.preventDefault();
                          handleDeleteRoom(room);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription>{room.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Files className="h-4 w-4 text-muted-foreground" />
                  <span>{room.documentsCount} documentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{room.accessesCount} acessos</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Criado em {new Date(room.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <span>Última atividade: {room.lastActivity}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roomList.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <Folders className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhum Data Room encontrado</CardTitle>
          <CardDescription className="text-center mb-4">
            Comece criando seu primeiro data room para organizar e compartilhar documentos de forma segura.
          </CardDescription>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeiro Data Room
          </Button>
        </Card>
      )}

      {/* Dialog para Criar Data Room */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Data Room</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo data room seguro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome do Data Room</Label>
              <Input
                id="create-name"
                placeholder="Ex: Projeto Alpha"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Descrição</Label>
              <Textarea
                id="create-description"
                placeholder="Descreva o propósito deste data room..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-status">Status Inicial</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="create-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRoom} disabled={!formData.name || !formData.description}>
              Criar Data Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Data Room */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => !open && setEditDialog({ open: false, room: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Data Room</DialogTitle>
            <DialogDescription>
              Atualize as informações do data room.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Data Room</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, room: null })}>
              Cancelar
            </Button>
            <Button onClick={confirmEdit} disabled={!formData.name || !formData.description}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Confirmar Exclusão */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, room: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão do Data Room</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Você tem certeza que deseja excluir o data room{" "}
                  <strong>"{deleteDialog.room?.name}"</strong>?
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 my-3">
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">Esta ação irá excluir permanentemente:</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Files className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{deleteDialog.room?.documentsCount} documentos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{deleteDialog.room?.accessesCount} registros de acesso</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 text-muted-foreground">🔗</span>
                        <span>Todos os links de compartilhamento</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Data Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}