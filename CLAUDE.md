# Dooor Frontend Scaffold - Arquitetura e Padrões

Este documento define a arquitetura, padrões e convenções para o scaffold frontend da Dooor. **Siga estas regras rigorosamente** em todas as edições e criações de código.

## Sobre o Scaffold

Este é um **SCAFFOLD REUTILIZÁVEL** que serve como base para criar aplicações frontend. Ele inclui funcionalidades essenciais pré-configuradas:

- **Autenticação** - Sistema completo com Google OAuth, Magic Link e refresh tokens
- **Multitenancy** - Suporte a Organizations e Workspaces
- **Chat com IA** - Sistema de chat integrado com AI SDK da Vercel
- **Gerenciamento de Documentos** - Upload, visualização e contexto em chats
- **Temas** - Dark/Light mode com next-themes
- **Command Palette** - Navegação rápida com CMDK

### Configuração do Scaffold

O scaffold é **100% configurável via environment variables**:

```bash
# Nome da aplicação (aparece na UI, login, etc)
NEXT_PUBLIC_APP_NAME=NomeDaSuaApp

# URL da API backend
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_API_URL=https://api.example.com

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**IMPORTANTE**: Este scaffold é **FRONTEND-ONLY**. Não utilize Server-Side Rendering (SSR) ou Server Components do Next.js para lógica de negócio. O Next.js é usado apenas como framework de roteamento e build tool.

---

## Arquitetura de Pastas

### Estrutura Completa

```
/src
  /app                    # Next.js App Router (APENAS routing e layouts)
    /(dashboard)          # Grupo de rotas protegidas (requer autenticação)
      /org                # Multitenancy - Organizations
        /[orgId]          # Rotas dinâmicas por organização
          /workspace      # Workspaces dentro de organizações
            /[workspaceId] # Rotas dinâmicas por workspace
    /(public)             # Grupo de rotas públicas (não requer auth)
      /login              # Tela de login
    /auth                 # Callbacks de autenticação
      /magic-link         # Callback do magic link
      /success            # Sucesso na autenticação
    /api                  # Route Handlers (APENAS para proxy/streaming)
      /chat               # Stream de chat com IA

  /components             # Componentes React reutilizáveis
    /ui                   # Componentes Shadcn/ui (primitivos)
    /ai-elements          # Componentes específicos do AI SDK
    /auth                 # Componentes de autenticação
    /chat                 # Componentes do sistema de chat
    /layout               # Componentes de layout (sidebar, navbar, etc)
    /navigation           # Componentes de navegação
    /providers            # React Context Providers
    /workspace            # Componentes específicos de workspace

  /contexts               # React Contexts (use com moderação)
    auth-context.tsx      # Context de autenticação
    command-palette-context.tsx # Context do command palette

  /hooks                  # Hooks customizados
    /api                  # Hooks que consomem API
      use-api.ts          # Hooks base (useApiQuery, useApiMutation)
      use-chat.ts         # Hooks do sistema de chat
      use-documents.ts    # Hooks de documentos
      use-organization.ts # Hooks de organizações
      use-user-with-organizations.ts # Hooks de usuários
    use-mobile.ts         # Hook de detecção mobile
    use-google-oauth.ts   # Hook do Google OAuth
    use-command-palette.ts # Hook do command palette
    use-url-store-sync.ts # Sincronização de store com URL

  /lib                    # Bibliotecas, utilitários e configurações
    /api                  # Camada de API
      /client             # Cliente HTTP base
        base.client.ts    # BaseApiClient com interceptors
      /services           # Services que consomem API
        auth.service.ts   # Serviço de autenticação
        chat.service.ts   # Serviço de chat
        document.service.ts # Serviço de documentos
        organization.service.ts # Serviço de organizations
        user.service.ts   # Serviço de usuários
    /auth                 # Configurações de autenticação
      /hooks              # Hooks de autenticação
        use-auth.ts       # Hook principal de auth
        use-auth-guard.ts # Guard de rotas protegidas
      /stores             # Stores de autenticação
        auth.store.ts     # TokenStore (localStorage)
      /types              # Tipos de autenticação
        auth.types.ts     # Interfaces de auth
    utils.ts              # Utilitários gerais (cn, formatDate, etc)
    query-client.ts       # Configuração do React Query

  /store                  # Gerenciamento de estado global (Zustand)
    app-store.ts          # Store principal da aplicação

  /types                  # Definições TypeScript globais
    common.ts             # Tipos compartilhados (User, Organization, etc)
    chat.ts               # Tipos do sistema de chat
    stream.ts             # Tipos de streaming
```

---

## Regras de Arquitetura

### 1. Frontend-Only Architecture

**CRÍTICO**: Este scaffold é **100% client-side**. O Next.js é usado apenas para:
- Roteamento (App Router)
- Build optimization (Turbopack)
- Static exports
- Route handlers para proxy/streaming

**NUNCA faça:**
- Server Components com lógica de negócio
- Server Actions
- getServerSideProps / getStaticProps
- Renderização server-side de dados

**SEMPRE faça:**
- Client Components (`"use client"`)
- Fetch de dados via React Query no cliente
- Estado gerenciado no cliente (Zustand)
- Autenticação baseada em tokens no localStorage

### 2. Camada de Serviços (Service Layer)

Toda comunicação com API deve seguir este padrão:

```
Component → Hook (useApiQuery/useApiMutation) → Service → BaseApiClient → API
```

**Service Pattern:**

```typescript
// src/lib/api/services/example.service.ts
import { apiClient } from '@/lib/api/client/base.client'

export interface ExampleData {
  id: string
  name: string
}

export class ExampleService {
  // GET - Lista
  static async list(): Promise<ExampleData[]> {
    return apiClient.get<ExampleData[]>('/examples')
  }

  // GET - Por ID
  static async getById(id: string): Promise<ExampleData> {
    return apiClient.get<ExampleData>(`/examples/${id}`)
  }

  // POST - Criar
  static async create(data: Partial<ExampleData>): Promise<ExampleData> {
    return apiClient.post<ExampleData>('/examples', data)
  }

  // PUT - Atualizar
  static async update(id: string, data: Partial<ExampleData>): Promise<ExampleData> {
    return apiClient.put<ExampleData>(`/examples/${id}`, data)
  }

  // DELETE - Remover
  static async delete(id: string): Promise<void> {
    return apiClient.delete(`/examples/${id}`)
  }

  // UPLOAD - Arquivos
  static async upload(file: File): Promise<ExampleData> {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.upload<ExampleData>('/examples/upload', formData)
  }
}
```

**Hook Pattern:**

```typescript
// src/hooks/api/use-example.ts
import { useApiQuery, useApiMutation } from '@/hooks/api/use-api'
import { ExampleService } from '@/lib/api/services/example.service'

export function useExamples() {
  return useApiQuery(
    ['examples', 'list'],
    () => ExampleService.list(),
    {
      staleTime: 60000, // 1 minuto
    }
  )
}

export function useExample(id: string) {
  return useApiQuery(
    ['examples', id],
    () => ExampleService.getById(id),
    {
      enabled: !!id,
    }
  )
}

export function useCreateExample() {
  return useApiMutation(
    ExampleService.create,
    {
      successMessage: 'Exemplo criado com sucesso!',
      invalidateKeys: [['examples', 'list']],
    }
  )
}
```

### 3. Autenticação e Autorização

**Fluxo de Autenticação:**

1. **Login**: Usuário faz login (Google OAuth ou Magic Link)
2. **Tokens**: Backend retorna `accessToken` e `refreshToken`
3. **Storage**: Tokens salvos no `TokenStore` (localStorage)
4. **Headers**: `accessToken` enviado como `x-parse-session-token`
5. **Refresh**: Em 401, `BaseApiClient` tenta refresh automático
6. **Logout**: Tokens limpos, redirect para `/login`

**Token Store:**
- `TokenStore` é um Singleton que gerencia tokens no localStorage
- Subscrições para mudanças em tempo real
- Verificação automática de expiração

**Guards:**
```typescript
// Usar em componentes que precisam de autenticação
import { useAuthGuard } from '@/lib/auth/hooks/use-auth-guard'

export function ProtectedComponent() {
  useAuthGuard() // Redireciona para /login se não autenticado

  return <div>Conteúdo protegido</div>
}
```

**Route Groups:**
- `(dashboard)` - Rotas protegidas, usa layout com guard
- `(public)` - Rotas públicas, sem autenticação
- `/auth` - Callbacks de autenticação

### 4. Multitenancy (Organizations & Workspaces)

**Estrutura:**
- **Organization**: Entidade principal (empresa, time)
- **Workspace**: Espaço de trabalho dentro de uma Organization
- **User**: Pode pertencer a múltiplas Organizations/Workspaces com diferentes roles

**Fluxo de Navegação:**
```
/org → Lista organizations do usuário
/org/[orgId] → Dashboard da organization
/org/[orgId]/workspace/[workspaceId] → Workspace específico (chat + docs)
```

**Estado:**
```typescript
// Store mantém contexto atual
const currentOrganization = useCurrentOrganization()
const currentWorkspace = useCurrentWorkspace()

// Sincronizado com URL via providers
<OrganizationProvider orgId={params.orgId}>
  <WorkspaceProvider workspaceId={params.workspaceId}>
    {children}
  </WorkspaceProvider>
</OrganizationProvider>
```

**IMPORTANTE**: Organization e Workspace são **driven by URL**, não persistidos no localStorage.

### 5. Sistema de Chat com IA

**Features:**
- Chat em tempo real com streaming
- Contexto de documentos
- Histórico de conversas
- Múltiplos chats por workspace

**Arquitetura:**

```typescript
// 1. Hook para mensagens
const { messages, sendMessage, isLoading } = useStreamChat(workspaceId, chatId)

// 2. Service envia mensagem
ChatService.sendMessage(workspaceId, chatId, message, documentIds)

// 3. Route Handler faz proxy do stream
// src/app/api/chat/route.ts
export async function POST(request: Request) {
  // Proxy para backend com streaming
}

// 4. Componentes AI
import { PromptInput, Message, Response } from '@/components/ai-elements'
```

**Documentos no Chat:**
- Upload via `DocumentService.upload()`
- Associação com workspace
- Contexto adicionado ao chat via `documentIds[]`

### 6. Gerenciamento de Estado

**Zustand (Estado Global):**

```typescript
// src/store/app-store.ts
export const useAppStore = create()(
  persist(
    (set) => ({
      user: null,
      theme: 'system',
      sidebarOpen: true,

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        // NÃO persistir: organization, workspace (driven by URL)
      }),
    }
  )
)

// Selector hooks para performance
export const useUser = () => useAppStore((state) => state.user)
export const useTheme = () => useAppStore((state) => state.theme)
```

**Quando usar cada ferramenta:**
- **Zustand**: Estado global persistente (user, theme, preferences)
- **React Query**: Cache de dados de API (invalidação automática)
- **useState**: Estado local de componente
- **Context**: Apenas para providers de biblioteca (Theme, Query)

**NUNCA:**
- Context API para estado complexo (use Zustand)
- Props drilling (use Zustand ou Context)
- Estado global desnecessário

---

## Padrões de Desenvolvimento

### React Query (TanStack Query v5)

**SEMPRE use React Query para API:**

```typescript
// ✅ CORRETO
function UserProfile() {
  const { data: user, isLoading, error } = useApiQuery(
    ['users', 'me'],
    () => UserService.getProfile()
  )

  if (isLoading) return <Skeleton />
  if (error) return <ErrorDisplay error={error} />

  return <div>{user.name}</div>
}

// ❌ ERRADO - NUNCA use useEffect para fetch
function UserProfile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(setUser)
  }, [])

  return <div>{user?.name}</div>
}
```

**Mutations com invalidação:**

```typescript
const { mutate: createChat } = useApiMutation(
  ChatService.create,
  {
    successMessage: 'Chat criado!',
    invalidateKeys: [
      ['chats', 'list', workspaceId],
      ['workspaces', workspaceId]
    ],
  }
)
```

**Configuração padrão:**
- `staleTime`: 60000 (1 minuto)
- `retry`: 2 tentativas
- `refetchOnWindowFocus`: false
- Erros 401/404 não fazem retry

### TypeScript Strict

**SEMPRE:**
- Interfaces para todos os dados de API
- Tipos explícitos em props de componentes
- Path mapping `@/*` para imports

**NUNCA:**
- `any` (use `unknown` + type guards)
- Ignore warnings do TypeScript
- Tipos duplicados (reutilize)

```typescript
// ✅ CORRETO
interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

interface ChatProps {
  messages: ChatMessage[]
  onSend: (message: string) => void
}

function Chat({ messages, onSend }: ChatProps) {
  // ...
}

// ❌ ERRADO
function Chat({ messages, onSend }: any) {
  // ...
}
```

### Componentes

**Princípios:**
- Componentes pequenos e focados
- Composição sobre herança
- Props tipadas com TypeScript
- Loading e error states sempre

**Client Components:**
```typescript
"use client" // SEMPRE no topo se usar hooks/estado

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ExampleComponent() {
  const [count, setCount] = useState(0)

  return <Button onClick={() => setCount(count + 1)}>{count}</Button>
}
```

**Organização por funcionalidade:**
- `/ui` - Componentes Shadcn (primitivos)
- `/chat` - Componentes do sistema de chat
- `/workspace` - Componentes de workspace
- `/auth` - Componentes de autenticação
- `/layout` - Shells, sidebars, navbars
- `/providers` - Wrappers de Context

### Shadcn/ui

**SEMPRE use Shadcn como base:**

```bash
# Adicionar novo componente
npx shadcn@latest add button
npx shadcn@latest add dialog
```

**Configuração:**
- Style: "new-york"
- Base color: neutral
- Ícones: Lucide React
- Tailwind v4 com CSS variables

**NUNCA:**
- Recrie componentes que existem no Shadcn
- Customize sem seguir as guidelines
- Ignore acessibilidade dos componentes

### Error Handling

**Padrão de tratamento:**

```typescript
// 1. React Query já trata erros automaticamente
const { data, error, isError } = useApiQuery(...)

if (isError) {
  return <ErrorDisplay error={error} />
}

// 2. Mutations com toast automático
const { mutate } = useApiMutation(
  Service.action,
  {
    showErrorToast: true, // Padrão
    onError: (error) => {
      // Tratamento adicional se necessário
      console.error(error)
    }
  }
)

// 3. ErrorBoundary para componentes críticos
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>
```

**NUNCA:**
- Ignore erros silenciosamente
- Use `console.log` para tratamento de erro
- Deixe usuário sem feedback

### Performance

**Otimizações:**
- React.memo apenas quando necessário (meça primeiro!)
- useMemo/useCallback conscientemente
- Lazy loading para componentes > 50KB
- Virtualização para listas > 100 items
- Next.js Image para imagens

**React Query otimizações:**
- Selector hooks para Zustand
- Query keys bem estruturadas
- staleTime apropriado
- Prefetch para navegação

```typescript
// ✅ CORRETO - Selector hook
const user = useUser() // Rerenderiza apenas se user mudar

// ❌ ERRADO - Subscribe ao store inteiro
const { user } = useAppStore() // Rerenderiza em qualquer mudança
```

---

## Naming Conventions

### Arquivos

```
kebab-case.tsx          # Componentes
kebab-case.ts           # Utilitários, services, stores
[param].tsx             # Rotas dinâmicas
(group)                 # Route groups
```

### Componentes

```typescript
PascalCase              # UserProfile, ChatMessage
```

### Hooks

```typescript
use[Feature][Action]    # useUserProfile, useChatMessages
use[State]              # useUser, useTheme
```

### Services

```typescript
[Entity]Service         # UserService, ChatService
```

### Stores

```typescript
[entity].store.ts       # auth.store.ts, app-store.ts
```

### Types

```typescript
[Entity]                # User, Organization, Chat
[Entity]Response        # UserResponse, ChatResponse
[Action][Entity]Request # CreateChatRequest, UpdateUserRequest
```

---

## Features do Scaffold

### 1. Autenticação

**Métodos suportados:**
- Google OAuth (`useGoogleOauth`)
- Magic Link (email)

**Componentes:**
- `LoginForm` - Formulário de login
- `AuthGuard` - Proteção de rotas

**Fluxo:**
1. Usuário acessa `/login`
2. Escolhe método (Google ou Email)
3. Backend retorna tokens
4. Tokens salvos no `TokenStore`
5. Redirect para `/org`

### 2. Multitenancy

**Estrutura:**
```
User → Organizations → Workspaces
```

**Navegação:**
```
/org                              # Lista de organizations
/org/[orgId]                      # Dashboard da org
/org/[orgId]/workspace/[workspaceId]  # Workspace com chat
```

**Providers:**
- `OrganizationProvider` - Carrega dados da org
- `WorkspaceProvider` - Carrega dados do workspace

### 3. Sistema de Chat

**Features:**
- Chat em tempo real com streaming
- Múltiplos chats por workspace
- Histórico de conversas
- Contexto de documentos

**Componentes principais:**
- `WorkspaceChat` - Interface do chat
- `ChatHistory` - Lista de chats
- `PromptInput` - Input de mensagens
- `Message` - Exibição de mensagens

**Hooks:**
- `useStreamChat` - Gerencia mensagens e streaming
- `useChats` - Lista chats do workspace
- `useCreateChat` - Cria novo chat

### 4. Documentos

**Features:**
- Upload de arquivos (PDF, TXT, etc)
- Visualização no browser
- Contexto em chats
- Associação com workspaces

**Componentes:**
- `WorkspaceSidebar` - Lista documentos
- `PDFViewer` - Visualiza PDFs

**Hooks:**
- `useDocuments` - Lista documentos
- `useUploadDocument` - Upload com progress

### 5. Command Palette

**Atalho:** `Cmd+K` / `Ctrl+K`

**Features:**
- Navegação rápida
- Busca de workspaces
- Ações globais
- Temas

**Uso:**
```typescript
const { open, setOpen } = useCommandPalette()
```

---

## Environment Variables

**Obrigatórias:**

```bash
# Nome da aplicação (UI, títulos, etc)
NEXT_PUBLIC_APP_NAME=SuaApp

# URL da API backend
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Opcionais:**

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# API Key (se necessário)
NEXT_PUBLIC_API_KEY=your-api-key
```

**Uso no código:**
```typescript
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'App'
```

---

## Scripts e Comandos

```bash
npm run dev          # Desenvolvimento com Turbopack
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run type-check   # Verificação TypeScript
```

---

## Checklist de Desenvolvimento

### Criando um novo recurso

- [ ] Defina tipos TypeScript em `/types` ou no service
- [ ] Crie service em `/lib/api/services/[entity].service.ts`
- [ ] Crie hooks em `/hooks/api/use-[entity].ts`
- [ ] Use `useApiQuery` e `useApiMutation`
- [ ] Implemente loading e error states
- [ ] Use componentes Shadcn/ui como base
- [ ] Adicione invalidação de cache nas mutations
- [ ] Teste fluxo de erro (401, 404, network)

### Criando um componente

- [ ] Arquivo em kebab-case: `my-component.tsx`
- [ ] Nome em PascalCase: `MyComponent`
- [ ] Props tipadas com TypeScript
- [ ] Use `"use client"` se necessário
- [ ] Implemente loading/error states
- [ ] Use composição (componentes pequenos)
- [ ] Documente props complexas (JSDoc)

### Adicionando rota

- [ ] Crie pasta em `/app/(dashboard)` ou `/(public)`
- [ ] Arquivo `page.tsx` com export default
- [ ] Layout específico se necessário (`layout.tsx`)
- [ ] Use guard se rota protegida
- [ ] Teste navegação e auth

---

## Regras Críticas - NUNCA Viole

### 1. Arquitetura

- ❌ NUNCA use Server Components para lógica de negócio
- ❌ NUNCA faça fetch direto em componentes (use React Query)
- ❌ NUNCA implemente cache manual (use React Query)
- ❌ NUNCA use Context API para estado complexo (use Zustand)

### 2. API e Dados

- ❌ NUNCA use `useEffect` para chamadas de API
- ❌ NUNCA ignore invalidação de cache em mutations
- ❌ NUNCA ignore estados de erro
- ❌ NUNCA desabilite toast de erro sem razão

### 3. TypeScript

- ❌ NUNCA use `any`
- ❌ NUNCA ignore warnings
- ❌ NUNCA crie tipos duplicados

### 4. Componentes

- ❌ NUNCA crie componentes monolíticos
- ❌ NUNCA ignore loading states
- ❌ NUNCA recrie componentes do Shadcn
- ❌ NUNCA ignore acessibilidade

### 5. Estado

- ❌ NUNCA crie estado global desnecessário
- ❌ NUNCA force re-renders
- ❌ NUNCA ignore dependências em hooks

---

## Stack Tecnológico

### Core
- **React 19.1.0** - Client Components
- **Next.js 15.5.3** - App Router (routing only)
- **TypeScript 5** - Strict mode
- **Tailwind CSS v4** - Styling

### UI
- **Shadcn/ui** - Componentes base
- **Radix UI** - Primitivos
- **Lucide React** - Ícones
- **Class Variance Authority** - Variantes

### Estado & Dados
- **Zustand 5** - Estado global
- **TanStack Query v5** - API cache
- **React Hook Form** - Formulários
- **Zod v4** - Validação

### Features
- **AI SDK** - Vercel AI SDK
- **Sonner** - Toasts
- **Next Themes** - Temas
- **CMDK** - Command Palette

---

**IMPORTANTE**: Este é um scaffold profissional. Qualquer desvio destas regras deve ser justificado e documentado.
