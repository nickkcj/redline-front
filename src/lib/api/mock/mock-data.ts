/**
 * Mock Data for Frontend Development
 */

import type { UserDTO } from '../types/user.types'
import type { OrganizationWithWorkspaces } from '../types/organization.types'
import type { WorkspaceResponseDto } from '../types/workspace.types'
import type { DocumentResponseDto } from '../types/document.types'

// Mock User
export const mockUser: UserDTO = {
  id: 'mock-user-1',
  email: 'dev@scaffold.com',
  name: 'Desenvolvedor',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Mock Organizations
export const mockOrganizations: OrganizationWithWorkspaces[] = [
  {
    id: 'org-1',
    name: 'Scaffold Inc.',
    description: 'Organização principal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workspaces: [
      {
        id: 'workspace-1',
        name: 'Projeto Frontend',
        description: 'Desenvolvimento do frontend Scaffold',
        organizationId: 'org-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'workspace-2',
        name: 'Projeto Backend',
        description: 'API e serviços',
        organizationId: 'org-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'workspace-3',
        name: 'Documentação',
        description: 'Documentação técnica do projeto',
        organizationId: 'org-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'org-2',
    name: 'Cliente Demo',
    description: 'Organização de demonstração',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workspaces: [
      {
        id: 'workspace-4',
        name: 'Projeto Demo',
        description: 'Projeto de demonstração',
        organizationId: 'org-2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
]

// Mock Workspaces
export const mockWorkspaces: WorkspaceResponseDto[] = [
  {
    id: 'workspace-1',
    name: 'Projeto Frontend',
    description: 'Desenvolvimento do frontend Scaffold',
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'workspace-2',
    name: 'Projeto Backend',
    description: 'API e serviços',
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock Documents
export const mockDocuments: DocumentResponseDto[] = [
  {
    id: 'doc-1',
    name: 'Manual do Usuário.pdf',
    description: 'Documentação completa do sistema',
    mimeType: 'application/pdf',
    size: 2048576,
    url: 'https://example.com/manual.pdf',
    workspaceId: 'workspace-1',
    uploadedById: 'mock-user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-2',
    name: 'Especificações Técnicas.pdf',
    description: 'Requisitos técnicos do projeto',
    mimeType: 'application/pdf',
    size: 1024000,
    url: 'https://example.com/specs.pdf',
    workspaceId: 'workspace-1',
    uploadedById: 'mock-user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-3',
    name: 'Apresentação.pptx',
    description: 'Slides da apresentação',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 5120000,
    url: 'https://example.com/presentation.pptx',
    workspaceId: 'workspace-1',
    uploadedById: 'mock-user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock Members
export const mockMembers = [
  {
    id: 'member-1',
    user: mockUser,
    role: 'admin',
    joinedAt: new Date().toISOString(),
  },
  {
    id: 'member-2',
    user: {
      id: 'user-2',
      email: 'maria@scaffold.com',
      name: 'Maria Silva',
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    role: 'member',
    joinedAt: new Date().toISOString(),
  },
]

// Mock Roles
export const mockRoles = [
  {
    id: 'role-1',
    name: 'admin',
    description: 'Administrador com acesso total',
    permissions: ['read', 'write', 'delete', 'manage'],
  },
  {
    id: 'role-2',
    name: 'member',
    description: 'Membro com acesso básico',
    permissions: ['read', 'write'],
  },
  {
    id: 'role-3',
    name: 'viewer',
    description: 'Visualizador apenas leitura',
    permissions: ['read'],
  },
]

// Mock Chat Messages
export const mockChatMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Como posso criar uma nova organização?',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Para criar uma nova organização, clique no botão "Nova Organização" na página principal. Você precisará fornecer um nome e uma descrição.',
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
]
