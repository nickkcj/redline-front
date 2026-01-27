'use client'

import * as React from 'react'
import { 
  Folder, 
  FileText, 
  DotsThreeVertical, 
  Plus, 
  MagnifyingGlass, 
  CaretRight, 
  Download, 
  ShareNetwork, 
  Trash,
  FolderPlus,
  FilePlus
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

// Mock Data
const initialFolders = [
  { id: '1', name: 'Projetos', parentId: null },
  { id: '2', name: 'Financeiro', parentId: null },
  { id: '3', name: 'Marketing', parentId: null },
  { id: '4', name: 'Q1 2024', parentId: '1' },
  { id: '5', name: 'Campanhas', parentId: '3' },
]

const initialFiles = [
  { id: '1', name: 'Proposta.pdf', folderId: '1', type: 'pdf', size: '2.4 MB', date: '2024-03-10' },
  { id: '2', name: 'Orçamento.xlsx', folderId: '2', type: 'xlsx', size: '1.2 MB', date: '2024-03-11' },
  { id: '3', name: 'Briefing.docx', folderId: '3', type: 'docx', size: '500 KB', date: '2024-03-12' },
  { id: '4', name: 'Cronograma.pdf', folderId: '4', type: 'pdf', size: '1.8 MB', date: '2024-03-13' },
]

interface ContextMenuState {
  x: number
  y: number
  isOpen: boolean
  targetId?: string
  targetType?: 'folder' | 'file' | 'background'
}

function DocumentosPage() {
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)
  const [folders, setFolders] = React.useState(initialFolders)
  const [files, setFiles] = React.useState(initialFiles)
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState>({ x: 0, y: 0, isOpen: false })

  // Filter items for current view
  const currentFolders = folders.filter(f => f.parentId === currentFolderId)
  const currentFiles = files.filter(f => (currentFolderId ? f.folderId === currentFolderId : true)) // Show all if no folder selected (or root)

  // Breadcrumbs
  const getBreadcrumbs = () => {
    if (!currentFolderId) return [{ id: null, name: 'Files' }]
    
    const path = []
    let current = folders.find(f => f.id === currentFolderId)
    while (current) {
      path.unshift(current)
      current = folders.find(f => f.id === current.parentId)
    }
    return [{ id: null, name: 'Files' }, ...path]
  }

  const handleContextMenu = (e: React.MouseEvent, id?: string, type?: 'folder' | 'file') => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      targetId: id,
      targetType: type || 'background'
    })
  }

  const closeContextMenu = () => setContextMenu({ ...contextMenu, isOpen: false })

  React.useEffect(() => {
    const handleClick = () => closeContextMenu()
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="flex h-screen w-full bg-background" onContextMenu={(e) => handleContextMenu(e)}>
      {/* Left Sidebar - Folder Tree */}
      <div className="w-64 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-2">Pastas</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => {
              const name = prompt("Nome da nova pasta:")
              if (name) {
                setFolders([...folders, { id: Date.now().toString(), name, parentId: currentFolderId }])
              }
            }}
          >
            <FolderPlus className="h-4 w-4" />
            Nova Pasta
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Button
              variant={currentFolderId === null ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setCurrentFolderId(null)}
            >
              <Folder className="h-4 w-4" />
              Todos os Arquivos
            </Button>
            {folders.filter(f => f.parentId === null).map(folder => (
              <FolderItem 
                key={folder.id} 
                folder={folder} 
                allFolders={folders} 
                currentFolderId={currentFolderId}
                onSelect={setCurrentFolderId}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b flex items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
            {getBreadcrumbs().map((crumb, index, arr) => (
              <React.Fragment key={crumb.id || 'root'}>
                <button 
                  onClick={() => setCurrentFolderId(crumb.id as string | null)}
                  className="hover:text-foreground transition-colors truncate"
                >
                  {crumb.name}
                </button>
                {index < arr.length - 1 && <CaretRight className="h-4 w-4 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <MagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar..." className="pl-8 h-8" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-4">
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {/* Folders */}
            {currentFolders.map(folder => (
              <div
                key={folder.id}
                className="group relative flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all"
                onClick={() => setCurrentFolderId(folder.id)}
                onContextMenu={(e) => handleContextMenu(e, folder.id, 'folder')}
              >
                <Folder className="h-12 w-12 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-center truncate w-full">{folder.name}</span>
              </div>
            ))}

            {/* Files */}
            {currentFiles.map(file => (
              <div
                key={file.id}
                className="group relative flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all"
                onContextMenu={(e) => handleContextMenu(e, file.id, 'file')}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <DotsThreeVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem>Renomear</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <FileIcon type={file.type} className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium text-center truncate w-full">{file.name}</span>
                <span className="text-xs text-muted-foreground">{file.size}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Custom Context Menu */}
      {contextMenu.isOpen && (
        <div
          className="fixed z-50 min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.targetType === 'background' ? (
            <>
              <ContextMenuItem icon={FolderPlus} label="Nova Pasta" onClick={() => {
                 const name = prompt("Nome da nova pasta:")
                 if (name) {
                   setFolders([...folders, { id: Date.now().toString(), name, parentId: currentFolderId }])
                   closeContextMenu()
                 }
              }} />
              <ContextMenuItem icon={FilePlus} label="Novo Arquivo" onClick={() => {
                // Mock file creation
                const name = prompt("Nome do arquivo:")
                if (name) {
                  setFiles([...files, { 
                    id: Date.now().toString(), 
                    name, 
                    folderId: currentFolderId || '1', // Default to 1 if null, or handle root
                    type: 'txt', 
                    size: '0 KB', 
                    date: new Date().toISOString().split('T')[0] 
                  }])
                  closeContextMenu()
                }
              }} />
            </>
          ) : (
            <>
              <ContextMenuItem icon={ShareNetwork} label="Compartilhar" />
              <ContextMenuItem icon={Download} label="Download" />
              <ContextMenuItem icon={Trash} label="Excluir" className="text-destructive focus:text-destructive" />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function FolderItem({ folder, allFolders, currentFolderId, onSelect, level = 0 }: any) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = allFolders.some((f: any) => f.parentId === folder.id)

  return (
    <div>
      <Button
        variant={currentFolderId === folder.id ? "secondary" : "ghost"}
        className={cn("w-full justify-start gap-2 px-2", level > 0 && "pl-6")}
        onClick={() => {
          onSelect(folder.id)
          if (hasChildren) setIsOpen(!isOpen)
        }}
      >
        {hasChildren && (
          <CaretRight 
            className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")} 
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
          />
        )}
        {!hasChildren && <div className="w-3" />}
        <Folder className="h-4 w-4 text-blue-500" />
        <span className="truncate">{folder.name}</span>
      </Button>
      {isOpen && hasChildren && (
        <div className="ml-2 border-l pl-1">
          {allFolders.filter((f: any) => f.parentId === folder.id).map((child: any) => (
            <FolderItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              currentFolderId={currentFolderId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FileIcon({ type, className }: { type: string, className?: string }) {
  // Simple color mapping
  const colors: Record<string, string> = {
    pdf: "text-red-500",
    xlsx: "text-green-500",
    docx: "text-blue-500",
    txt: "text-gray-500"
  }
  return <FileText className={cn(colors[type] || "text-gray-500", className)} />
}

function ContextMenuItem({ icon: Icon, label, onClick, className }: any) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}

export default DocumentosPage;
