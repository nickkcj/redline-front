# 🎭 Modo Mock - Frontend Independente

## ✅ O QUE FOI IMPLEMENTADO

O frontend agora funciona **100% independente do backend** usando dados mockados!

### Funcionalidades Mockadas

- ✅ **Autenticação**
  - Login com Google (simulado)
  - Magic Link (simulado)
  - Logout
  - Informações do usuário

- ✅ **Organizações**
  - Listar organizações (2 organizações de exemplo)
  - Criar nova organização
  - Editar organização
  - Deletar organização

- ✅ **Workspaces (Projetos)**
  - Listar projetos (4 projetos de exemplo)
  - Criar novo projeto
  - Editar projeto
  - Deletar projeto
  - Sair do projeto

- ✅ **Documentos**
  - Listar documentos (3 documentos de exemplo)
  - Upload de documentos
  - Deletar documentos

- ✅ **Membros e Roles**
  - Listar membros
  - Listar roles/permissões

- ✅ **Chat**
  - Enviar mensagens (respostas mockadas)
  - Histórico de chat

---

## 🚀 COMO USAR

### 1. Inicie o Frontend

```bash
npm run dev
```

### 2. Acesse o Sistema

```
http://localhost:3000/login
```

### 3. Faça Login

Clique em qualquer botão de login:
- **"Entrar com Google"** → Você será redirecionado automaticamente após 1 segundo
- **"Entrar com Email"** → Digite qualquer email e você entrará

### 4. Explore o Sistema

Você terá acesso a:
- **2 Organizações** pré-criadas:
  - "Scaffold Inc." (com 3 projetos)
  - "Cliente Demo" (com 1 projeto)

- **4 Projetos** pré-criados:
  - Projeto Frontend
  - Projeto Backend
  - Documentação
  - Projeto Demo

- **3 Documentos** de exemplo em cada projeto

---

## 🎯 DADOS MOCKADOS

### Usuário Padrão
```typescript
{
  id: 'mock-user-1',
  email: 'dev@scaffold.com',
  name: 'Desenvolvedor',
  avatar: null
}
```

### Console Logs

Todas as operações mostram logs no console do navegador:
```
[MOCK] Login: dev@scaffold.com
[MOCK] Get Organizations
[MOCK] Create Workspace: Novo Projeto
```

Isso ajuda a visualizar o que está acontecendo!

---

## 🔧 COMO FUNCIONA

### Arquivos do Sistema Mock

```
src/lib/api/mock/
├── mock-data.ts       → Dados mockados (usuários, organizações, etc)
├── mock-client.ts     → Cliente API mock (simula todas as requisições)
```

### Flag de Controle

No arquivo `src/lib/api/mock/mock-client.ts`:

```typescript
export const MOCK_MODE = true  // true = usa mock, false = usa backend real
```

### Como os Services Usam o Mock

Todos os services verificam a flag `MOCK_MODE`:

```typescript
// Exemplo: auth.service.ts
static async getUserInfo(): Promise<UserDTO> {
  if (MOCK_MODE) {
    return mockApiClient.getUserInfo()
  }
  return apiClient.get<UserDTO>('/auth/me')
}
```

---

## 🔄 VOLTANDO PARA O BACKEND REAL

Quando o backend estiver pronto:

### Opção 1: Desativar Mock Globalmente

Edite `src/lib/api/mock/mock-client.ts`:

```typescript
export const MOCK_MODE = false  // Desativa o mock
```

### Opção 2: Desativar por Variável de Ambiente

1. Adicione no `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK=false
```

2. Edite `src/lib/api/mock/mock-client.ts`:
```typescript
export const MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
```

### Opção 3: Remover o Mock Completamente

Quando não precisar mais:
1. Delete a pasta `src/lib/api/mock/`
2. Remova os imports de mock dos services
3. Remova as condicionais `if (MOCK_MODE)`

---

## 📝 PERSONALIZANDO OS DADOS MOCK

### Adicionar Mais Organizações

Edite `src/lib/api/mock/mock-data.ts`:

```typescript
export const mockOrganizations: OrganizationWithWorkspaces[] = [
  // ... organizações existentes
  {
    id: 'org-3',
    name: 'Minha Nova Organização',
    description: 'Descrição aqui',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workspaces: [],
  },
]
```

### Adicionar Mais Documentos

```typescript
export const mockDocuments: DocumentResponseDto[] = [
  // ... documentos existentes
  {
    id: 'doc-4',
    name: 'Meu Documento.pdf',
    description: 'Descrição',
    mimeType: 'application/pdf',
    size: 1024000,
    url: 'https://example.com/doc.pdf',
    workspaceId: 'workspace-1',
    uploadedById: 'mock-user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
```

---

## 💡 DICAS

### 1. Persistência

Os dados mockados **NÃO persistem** entre reloads da página. Se você criar uma organização nova, ela desaparecerá ao recarregar.

**Para persistir:** Use `localStorage` no `mock-client.ts`:

```typescript
constructor() {
  const saved = localStorage.getItem('mock-data')
  if (saved) {
    const data = JSON.parse(saved)
    this.organizations = data.organizations
    this.workspaces = data.workspaces
  }
}

// Salvar após cada operação
private save() {
  localStorage.setItem('mock-data', JSON.stringify({
    organizations: this.organizations,
    workspaces: this.workspaces,
  }))
}
```

### 2. Delay Realista

O mock já simula delay de rede (200-500ms) para uma experiência mais realista:

```typescript
const mockDelay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 300 + 200)
)
```

### 3. Erros Mockados

Para testar tratamento de erros, edite `mock-client.ts`:

```typescript
async createOrganization(data: CreateOrganizationDto) {
  await mockDelay()
  
  // Simular erro
  if (data.name === 'erro') {
    throw new Error('Erro simulado!')
  }
  
  // ... resto do código
}
```

---

## 🎨 INTERFACE ATUAL

Tudo está usando o **tema Notion-like** que configuramos:
- ✅ Botões arredondados
- ✅ Cores suaves (Notion palette)
- ✅ Shadows mínimas
- ✅ Hover effects sutis
- ✅ Tags coloridas no estilo Notion

---

## 🚀 PRÓXIMOS PASSOS

1. **Desenvolva o frontend** sem se preocupar com o backend
2. **Teste todas as funcionalidades** usando os dados mockados
3. **Quando o backend estiver pronto**, basta mudar `MOCK_MODE = false`
4. **Tudo continuará funcionando** com dados reais!

---

## 📊 STATUS ATUAL

```
Frontend: ✅ Funcionando 100% com mocks
Backend: ⏸️ Desconectado (você escolheu focar no frontend)
UI/UX: ✅ Notion-like theme aplicado
```

---

## ❓ DÚVIDAS?

Se precisar adicionar mais funcionalidades mockadas ou personalizar algo, é só me avisar!

Bom desenvolvimento! 🎉
