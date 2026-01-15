/**
 * Mock API Client for Frontend Development
 * Simula todas as chamadas de API sem backend
 */

import {
  mockUser,
  mockOrganizations,
  mockWorkspaces,
  mockDocuments,
  mockMembers,
  mockRoles,
  mockChatMessages,
} from './mock-data'
import type { UserDTO } from '../types/user.types'
import type { OrganizationWithWorkspaces, CreateOrganizationDto, UpdateOrganizationDto } from '../types/organization.types'
import type { WorkspaceResponseDto, CreateWorkspaceDto, UpdateWorkspaceDto } from '../types/workspace.types'
import type { DocumentResponseDto } from '../types/document.types'

// Simula delay de rede (200-500ms)
const mockDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))

// Flag para ativar/desativar o modo mock
export const MOCK_MODE = true

class MockApiClient {
  private isAuthenticated = false
  private organizations = [...mockOrganizations]
  private workspaces = [...mockWorkspaces]
  private documents = [...mockDocuments]

  // Auth
  async login(email: string): Promise<{ success: boolean; sessionToken: string; user: UserDTO }> {
    await mockDelay()
    console.log('[MOCK] Login:', email)
    this.isAuthenticated = true
    return {
      success: true,
      sessionToken: 'mock-session-token-' + Date.now(),
      user: mockUser,
    }
  }

  async googleLogin(): Promise<{ authUrl: string }> {
    await mockDelay()
    console.log('[MOCK] Google Login')
    // Simula redirecionamento imediato
    setTimeout(() => {
      this.isAuthenticated = true
      window.location.href = '/'
    }, 1000)
    return {
      authUrl: 'mock-google-auth-url',
    }
  }

  async getUserInfo(): Promise<UserDTO> {
    await mockDelay()
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated')
    }
    return mockUser
  }

  async logout(): Promise<void> {
    await mockDelay()
    console.log('[MOCK] Logout')
    this.isAuthenticated = false
  }

  // Organizations
  async getOrganizations(): Promise<OrganizationWithWorkspaces[]> {
    await mockDelay()
    console.log('[MOCK] Get Organizations')
    return this.organizations
  }

  async getOrganization(id: string): Promise<OrganizationWithWorkspaces> {
    await mockDelay()
    console.log('[MOCK] Get Organization:', id)
    const org = this.organizations.find(o => o.id === id)
    if (!org) throw new Error('Organization not found')
    return org
  }

  async createOrganization(data: CreateOrganizationDto): Promise<OrganizationWithWorkspaces> {
    await mockDelay()
    console.log('[MOCK] Create Organization:', data)
    const newOrg: OrganizationWithWorkspaces = {
      id: 'org-' + Date.now(),
      name: data.name,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspaces: [],
    }
    this.organizations.push(newOrg)
    return newOrg
  }

  async updateOrganization(id: string, data: UpdateOrganizationDto): Promise<OrganizationWithWorkspaces> {
    await mockDelay()
    console.log('[MOCK] Update Organization:', id, data)
    const org = this.organizations.find(o => o.id === id)
    if (!org) throw new Error('Organization not found')
    Object.assign(org, data, { updatedAt: new Date().toISOString() })
    return org
  }

  async deleteOrganization(id: string): Promise<void> {
    await mockDelay()
    console.log('[MOCK] Delete Organization:', id)
    this.organizations = this.organizations.filter(o => o.id !== id)
  }

  // Workspaces
  async getWorkspaces(organizationId: string): Promise<WorkspaceResponseDto[]> {
    await mockDelay()
    console.log('[MOCK] Get Workspaces for org:', organizationId)
    return this.workspaces.filter(w => w.organizationId === organizationId)
  }

  async getWorkspace(id: string): Promise<WorkspaceResponseDto> {
    await mockDelay()
    console.log('[MOCK] Get Workspace:', id)
    const workspace = this.workspaces.find(w => w.id === id)
    if (!workspace) throw new Error('Workspace not found')
    return workspace
  }

  async createWorkspace(organizationId: string, data: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    await mockDelay()
    console.log('[MOCK] Create Workspace:', organizationId, data)
    const newWorkspace: WorkspaceResponseDto = {
      id: 'workspace-' + Date.now(),
      name: data.name,
      description: data.description || '',
      organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.workspaces.push(newWorkspace)
    
    // Adiciona ao organization também
    const org = this.organizations.find(o => o.id === organizationId)
    if (org) {
      org.workspaces.push(newWorkspace)
    }
    
    return newWorkspace
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceDto): Promise<WorkspaceResponseDto> {
    await mockDelay()
    console.log('[MOCK] Update Workspace:', id, data)
    const workspace = this.workspaces.find(w => w.id === id)
    if (!workspace) throw new Error('Workspace not found')
    Object.assign(workspace, data, { updatedAt: new Date().toISOString() })
    return workspace
  }

  async deleteWorkspace(id: string): Promise<void> {
    await mockDelay()
    console.log('[MOCK] Delete Workspace:', id)
    this.workspaces = this.workspaces.filter(w => w.id !== id)
    
    // Remove do organization também
    this.organizations.forEach(org => {
      org.workspaces = org.workspaces.filter(w => w.id !== id)
    })
  }

  // Documents
  async getDocuments(workspaceId: string): Promise<DocumentResponseDto[]> {
    await mockDelay()
    console.log('[MOCK] Get Documents for workspace:', workspaceId)
    return this.documents.filter(d => d.workspaceId === workspaceId)
  }

  async uploadDocument(workspaceId: string, file: File): Promise<DocumentResponseDto> {
    await mockDelay()
    console.log('[MOCK] Upload Document:', file.name, 'to workspace:', workspaceId)
    const newDoc: DocumentResponseDto = {
      id: 'doc-' + Date.now(),
      name: file.name,
      description: '',
      mimeType: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      workspaceId,
      uploadedById: mockUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.documents.push(newDoc)
    return newDoc
  }

  async deleteDocument(id: string): Promise<void> {
    await mockDelay()
    console.log('[MOCK] Delete Document:', id)
    this.documents = this.documents.filter(d => d.id !== id)
  }

  // Members
  async getMembers(workspaceId: string): Promise<any[]> {
    await mockDelay()
    console.log('[MOCK] Get Members for workspace:', workspaceId)
    return mockMembers
  }

  // Roles
  async getRoles(): Promise<any[]> {
    await mockDelay()
    console.log('[MOCK] Get Roles')
    return mockRoles
  }

  // Chat
  async sendChatMessage(workspaceId: string, message: string): Promise<any> {
    await mockDelay()
    console.log('[MOCK] Send Chat Message:', message)
    return {
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: 'Esta é uma resposta mockada. O backend não está conectado.',
      timestamp: new Date().toISOString(),
    }
  }

  async getChatHistory(workspaceId: string): Promise<any[]> {
    await mockDelay()
    console.log('[MOCK] Get Chat History for workspace:', workspaceId)
    return mockChatMessages
  }
}

export const mockApiClient = new MockApiClient()
