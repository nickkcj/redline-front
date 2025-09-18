# Padrões Frontend Dooor - Regras para Claude

Este arquivo define os padrões e convenções para desenvolvimento frontend nos projetos da Dooor. **Siga estas regras rigorosamente** em todas as edições e criações de código.

## Estrutura de Pastas

```
/src
  /app          # Next.js App Router
    /(dashboard)  # Rotas protegidas
    /(public)     # Rotas públicas
    /auth         # Autenticação
  /components   # Componentes reutilizáveis
    /ui           # Componentes Shadcn/ui (gerenciados pelos devs)
    /ai-elements  # Componentes específicos de IA
    /auth         # Componentes de autenticação
    /layout       # Componentes de layout
    /providers    # Providers React
  /contexts     # React Contexts
  /hooks        # Hooks customizados
  /lib          # Utilitários e configurações
    /api          # Cliente e serviços de API
      /client     # Cliente HTTP
      /services   # Serviços específicos
    /auth         # Configurações de autenticação
      /hooks      # Hooks de auth
      /stores     # Stores de auth
    /services     # Outros serviços
    /types        # Tipos específicos
  /store        # Gerenciamento de estado (Zustand)
  /types        # Definições TypeScript globais
```

## **DOS - Sempre Faça**

### React Query
- Use React Query (TanStack Query v5) para **todas** as chamadas de API
- Use os hooks `useApiQuery` e `useApiMutation` do scaffold
- Defina query keys com prefixos organizacionais: `['users', 'list']`, `['products', id]`
- Implemente invalidação de cache nas mutations com `invalidateKeys`
- Configure staleTime apropriado para cada query (padrão: 1 minuto)
- Use configuração padrão do query client para retry e error handling

### TypeScript
- Use TypeScript strict mode sempre (configurado)
- Defina interfaces para todos os dados de API
- Use Zod v4 para validação de dados quando necessário
- Nunca use `any` - prefira `unknown` e type guards
- Use path mapping `@/*` para imports absolutos
- Mantenha target ES2017 para compatibilidade

### Estado e Hooks
- Use Zustand para estado global
- Use `useState` apenas para estado local de componente
- Crie hooks customizados para lógica complexa
- Use selector hooks para performance (`useUser`, `useTheme`, etc.)
- Mantenha hooks focados em uma responsabilidade

### Componentes
- Mantenha componentes pequenos
- Use composição sobre herança
- Implemente loading states em operações assíncronas
- Use TypeScript para props sempre
- Prefira Server Components quando possível (React 19 + Next.js 15)
- Use Shadcn/ui (style: "new-york") para componentes base
- Organize componentes por funcionalidade: `/ui`, `/auth`, `/layout`, `/ai-elements`

### Error Handling
- Use ErrorBoundary para componentes críticos
- Implemente tratamento de erro em todos os hooks de API
- Use `handleApiError` para padronizar erros
- Mostre feedback ao usuário com Sonner toasts
- Configure retry automático no React Query (máx 2 tentativas)
- Nunca ignore erros 401/404 no retry

### Performance
- Use React.memo para componentes que re-renderizam frequentemente
- Use useMemo/useCallback conscientemente (não por padrão)
- Implemente lazy loading para componentes pesados
- Use Next.js Image para otimização de imagens
- Use Turbopack para builds mais rápidos (configurado)
- Desabilite refetchOnWindowFocus no React Query por padrão

### Naming e Convenções
- Hooks: `use[Feature][Action]` (ex: `useUserProfile`, `useProductList`)
- Componentes: PascalCase (ex: `UserProfile`, `ProductCard`)
- Arquivos: kebab-case (ex: `user-profile.tsx`, `product-card.tsx`)
- Variáveis: camelCase (ex: `userData`, `isLoading`)
- Grupos de rotas: `(dashboard)` para rotas protegidas, `(public)` para rotas abertas
- Imports: Use path absoluto `@/` sempre que possível

### Shadcn/ui
- **SEMPRE** use componentes Shadcn/ui como base
- Configurado com style "new-york" e Radix UI
- Use aliases configurados: `@/components/ui`, `@/lib/utils`
- Lucide React para ícones
- Tailwind CSS v4 com variáveis CSS ativadas
- Base color: neutral

### AI SDK
- Use o AI SDK da Vercel para funcionalidades de IA
- Componentes específicos em `/components/ai-elements`
- Registry configurado para @ai-elements

### Acessibilidade
- Use semantic HTML sempre
- Implemente ARIA attributes quando necessário
- Garanta navegação por teclado
- Use cores com contraste adequado
- Componentes Shadcn já incluem acessibilidade

## **DON'TS - Nunca Faça**

### React Query e APIs
- **NUNCA** use useEffect para chamadas de API
- **NUNCA** ignore estados de erro em queries
- **NUNCA** faça fetch de dados diretamente em componentes
- **NUNCA** implemente cache manual (use React Query)
- **NUNCA** desabilite toast de erro sem uma boa razão
- **NUNCA** ignore invalidação de cache nas mutações

### Estado e Performance
- **NUNCA** crie estado global desnecessário
- **NUNCA** use Context API para estado complexo (use Zustand)
- **NUNCA** force re-renders desnecessários
- **NUNCA** ignore dependências em useEffect/useMemo/useCallback

### TypeScript e Qualidade
- **NUNCA** use `any` no TypeScript
- **NUNCA** ignore warnings do TypeScript
- **NUNCA** crie tipos duplicados (reutilize interfaces)

### Componentes e Hooks
- **NUNCA** crie componentes monolíticos
- **NUNCA** crie hooks com mais de 3 responsabilidades
- **NUNCA** ignore loading states
- **NUNCA** misture lógica de apresentação com lógica de negócio
- **NUNCA** recrie componentes que já existem no Shadcn/ui
- **NUNCA** ignore as convenções de nomenclatura de arquivos

### Error Handling
- **NUNCA** ignore erros silenciosamente
- **NUNCA** use console.log para tratamento de erro (use proper logging)
- **NUNCA** deixe o usuário sem feedback em caso de erro

### Acessibilidade e UX
- **NUNCA** ignore acessibilidade
- **NUNCA** use apenas cor para transmitir informação
- **NUNCA** deixe botões/links sem feedback visual
- **NUNCA** customize componentes Shadcn sem seguir as guidelines
- **NUNCA** implemente toasts sem usar Sonner

## Utilitários Padrão

### Hooks Disponíveis
- `useApiQuery` - Para queries de API (wrapper do TanStack Query)
- `useApiMutation` - Para mutations de API com toast automático
- `useUser`, `useTheme`, `useSidebarOpen` - Estado global
- `useCommandPalette` - Command palette
- `useGoogleOauth` - Autenticação Google
- `useMobile` - Detecção de dispositivo móvel
- `useUrlStoreSync` - Sincronização de estado com URL
- `useUserWithOrganizations` - Dados do usuário com organizações

### Utilitários
- `cn()` - Para merge de classes CSS (clsx + tailwind-merge)
- `handleApiError()` - Para padronizar erros
- `formatDate()`, `formatDateTime()` - Para formatação (pt-BR)
- `debounce()` - Para otimização
- `createQueryClient()` - Configuração do React Query client

### Componentes Base
- `ErrorBoundary` - Para captura de erros
- `ErrorDisplay` - Para exibição de erros
- `QueryProvider` - Para React Query
- Componentes Shadcn/ui: Button, Card, Dialog, Alert, Avatar, etc.
- Componentes AI: elementos específicos do AI SDK
- Toasts: Sonner para notificações

## Comentários e Documentação

### Quando Comentar
- **SIM**: Lógica complexa de negócio
- **SIM**: Decisões não óbvias de implementação
- **SIM**: JSDoc para funções públicas/utilitários
- **NÃO**: Código auto-explicativo
- **NÃO**: O que o código faz (explique o porquê)

### Exemplo de Bom Comentário
```typescript
// Cache invalidation needed here because user permissions
// affect multiple data sources across the app
queryClient.invalidateQueries(['user'])
```

### Exemplo de Comentário Desnecessário
```typescript
// Set loading to true
setLoading(true)
```

## Performance Guidelines

- Lazy load componentes > 50KB
- Use Next.js dynamic imports para rotas pesadas
- Implemente virtualização para listas > 100 items
- Optimize bundle com análise regular
- Use React.memo apenas quando necessário (meça primeiro)
- Aproveite o Turbopack para builds mais rápidos
- Configure staleTime apropriado no React Query (padrão: 1 minuto)
- Use Server Components quando possível (React 19)

## Stack Tecnológico

### Frontend Core
- **React 19.1.0** - Última versão com Server Components
- **Next.js 15.5.3** - App Router com Turbopack
- **TypeScript 5** - Strict mode ativado
- **Tailwind CSS v4** - Styling com variáveis CSS

### UI & Componentes
- **Shadcn/ui** - Componentes base (style: "new-york")
- **Radix UI** - Primitivos acessíveis
- **Lucide React** - Ícones
- **Class Variance Authority** - Variantes de componentes

### Estado & Dados
- **Zustand 5** - Gerenciamento de estado global
- **TanStack Query v5** - Cache e sincronização de dados
- **React Hook Form** - Formulários performáticos
- **Zod v4** - Validação de schemas

### Funcionalidades Especiais
- **AI SDK** - Integração com IA
- **Sonner** - Sistema de toasts
- **Next Themes** - Gerenciamento de temas
- **CMDK** - Command palette

## Scripts e Comandos

```bash
npm run dev          # Desenvolvimento com Turbopack (Next.js 15)
npm run build        # Build de produção com Turbopack
npm run start        # Servidor de produção
npm run type-check   # Verificação TypeScript standalone
```

---

**IMPORTANTE**: Estas regras são obrigatórias. Qualquer desvio deve ser justificado e documentado.