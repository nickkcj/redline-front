# Padrões Frontend Dooor - Regras para Claude

Este arquivo define os padrões e convenções para desenvolvimento frontend nos projetos da Dooor. **Siga estas regras rigorosamente** em todas as edições e criações de código.

## 📁 Estrutura de Pastas

```
/src
  /app          # Next.js App Router
  /components   # Componentes reutilizáveis
    /ui         # Componentes Shadcn/ui (gerenciados pelos devs)
  /hooks        # Hooks customizados
  /lib          # Utilitários e configurações
  /store        # Gerenciamento de estado (Zustand)
  /types        # Definições TypeScript
```

## ✅ **DOS - Sempre Faça**

### React Query
- Use React Query para **todas** as chamadas de API
- Use os hooks `useApiQuery` e `useApiMutation` do scaffold
- Defina query keys com prefixos organizacionais: `['users', 'list']`, `['products', id]`
- Implemente invalidação de cache nas mutations
- Configure staleTime apropriado para cada query

### TypeScript
- Use TypeScript strict mode sempre
- Defina interfaces para todos os dados de API
- Use `zod` para validação de dados quando necessário
- Nunca use `any` - prefira `unknown` e type guards

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
- Prefira Server Components quando possível

### Error Handling
- Use ErrorBoundary para componentes críticos
- Implemente tratamento de erro em todos os hooks de API
- Use `handleApiError` para padronizar erros
- Mostre feedback ao usuário com toast/notifications

### Performance
- Use React.memo para componentes que re-renderizam frequentemente
- Use useMemo/useCallback conscientemente (não por padrão)
- Implemente lazy loading para componentes pesados
- Use Next.js Image para otimização de imagens

### Naming e Convenções
- Hooks: `use[Feature][Action]` (ex: `useUserProfile`, `useProductList`)
- Componentes: PascalCase (ex: `UserProfile`, `ProductCard`)
- Arquivos: kebab-case (ex: `user-profile.tsx`, `product-card.tsx`)
- Variáveis: camelCase (ex: `userData`, `isLoading`)

### Acessibilidade
- Use semantic HTML sempre
- Implemente ARIA attributes quando necessário
- Garanta navegação por teclado
- Use cores com contraste adequado

## ❌ **DON'TS - Nunca Faça**

### React Query e APIs
- **NUNCA** use useEffect para chamadas de API
- **NUNCA** ignore estados de erro em queries
- **NUNCA** faça fetch de dados diretamente em componentes
- **NUNCA** implemente cache manual (use React Query)

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

### Error Handling
- **NUNCA** ignore erros silenciosamente
- **NUNCA** use console.log para tratamento de erro (use proper logging)
- **NUNCA** deixe o usuário sem feedback em caso de erro

### Acessibilidade e UX
- **NUNCA** ignore acessibilidade
- **NUNCA** use apenas cor para transmitir informação
- **NUNCA** deixe botões/links sem feedback visual

## 🔧 Utilitários Padrão

### Hooks Disponíveis
- `useApiQuery` - Para queries de API
- `useApiMutation` - Para mutations de API
- `useUser`, `useTheme`, `useSidebarOpen` - Estado global

### Utilitários
- `cn()` - Para merge de classes CSS
- `handleApiError()` - Para padronizar erros
- `formatDate()`, `formatDateTime()` - Para formatação
- `debounce()` - Para otimização

### Componentes Base
- `ErrorBoundary` - Para captura de erros
- `ErrorDisplay` - Para exibição de erros
- `QueryProvider` - Para React Query

## 📝 Comentários e Documentação

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

## 🚀 Performance Guidelines

- Lazy load componentes > 50KB
- Use Next.js dynamic imports para rotas pesadas
- Implemente virtualização para listas > 100 items
- Optimize bundle com análise regular
- Use React.memo apenas quando necessário (meça primeiro)

## 📊 Scripts e Comandos

```bash
npm run dev          # Desenvolvimento com Turbopack
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run type-check   # Verificação TypeScript standalone
```

---

**⚠️ IMPORTANTE**: Estas regras são obrigatórias. Qualquer desvio deve ser justificado e documentado.