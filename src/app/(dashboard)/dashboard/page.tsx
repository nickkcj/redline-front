"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, FileText, Link2, ScrollText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua conta Vaultly
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Data Room
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Rooms
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde o mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documentos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              +15 desde a semana passada
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Links Compartilhados
            </CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +4 esta semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Acessos
            </CardTitle>
            <ScrollText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +89 hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atividades em seus data rooms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div className="grid gap-1">
                <p className="font-medium leading-none">
                  Data Room "Projeto Alpha" criado
                </p>
                <p className="text-muted-foreground">
                  Há 2 horas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <FileText className="h-4 w-4" />
              </div>
              <div className="grid gap-1">
                <p className="font-medium leading-none">
                  5 documentos adicionados ao "Projeto Beta"
                </p>
                <p className="text-muted-foreground">
                  Há 4 horas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Link2 className="h-4 w-4" />
              </div>
              <div className="grid gap-1">
                <p className="font-medium leading-none">
                  Link compartilhado acessado 15 vezes
                </p>
                <p className="text-muted-foreground">
                  Há 6 horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Data Rooms Recentes</CardTitle>
            <CardDescription>
              Seus data rooms mais acessados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <span className="text-xs font-medium">PA</span>
              </div>
              <div className="grid gap-1">
                <p className="font-medium leading-none">Projeto Alpha</p>
                <p className="text-muted-foreground">23 documentos</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                Ativo
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <span className="text-xs font-medium">PB</span>
              </div>
              <div className="grid gap-1">
                <p className="font-medium leading-none">Projeto Beta</p>
                <p className="text-muted-foreground">18 documentos</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                Ativo
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <span className="text-xs font-medium">DD</span>
              </div>
              <div className="grid gap-1">
                <p className="font-medium leading-none">Due Diligence Q1</p>
                <p className="text-muted-foreground">41 documentos</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                Arquivado
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}