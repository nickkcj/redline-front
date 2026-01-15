# 🚀 Guia Rápido - Layout de Três Colunas

## Visão Geral

Foram implementados **dois tipos de layouts** com Shadcn UI:

### 1. ThreeColumnLayout (Layout Fixo)
- ✅ 3 colunas fixas
- ✅ Sidebar direita sempre com documentos
- ✅ Melhor para páginas que sempre precisam mostrar documentos

### 2. FlexibleLayout (Layout Flexível) ⭐ RECOMENDADO
- ✅ Sidebar direita customizável
- ✅ Pode ser ocultada
- ✅ Componentes de sidebar reutilizáveis
- ✅ Máxima flexibilidade

---

## 📂 Estrutura de Arquivos

```
src/
├── components/
│   └── layout/
│       ├── three-column-layout.tsx      # Layout fixo
│       ├── flexible-layout.tsx          # Layout flexível ⭐
│       └── sidebars/
│           ├── index.ts                 # Exports
│           ├── documents-sidebar.tsx    # Sidebar de documentos
│           └── activity-sidebar.tsx     # Sidebar de atividades
└── app/(dashboard)/
    ├── dashboard/page.tsx               # Dashboard principal
    ├── projetos/page.tsx                # Lista de projetos
    ├── documentos/page.tsx              # Gerenciamento de docs
    ├── equipe/page.tsx                  # Gerenciamento de equipe
    ├── configuracoes/page.tsx           # Configurações
    └── exemplo-flexivel/page.tsx        # Exemplo flexível ⭐
```

---

## 🎯 Como Usar

### Opção 1: Layout com Documentos

```tsx
import { FlexibleLayout } from '@/components/layout/flexible-layout'
import { DocumentsSidebar } from '@/components/layout/sidebars'

export default function Page() {
  return (
    <FlexibleLayout rightSidebar={<DocumentsSidebar />}>
      {/* Seu conteúdo */}
    </FlexibleLayout>
  )
}
```

### Opção 2: Layout com Atividades

```tsx
import { FlexibleLayout } from '@/components/layout/flexible-layout'
import { ActivitySidebar } from '@/components/layout/sidebars'

export default function Page() {
  return (
    <FlexibleLayout rightSidebar={<ActivitySidebar />}>
      {/* Seu conteúdo */}
    </FlexibleLayout>
  )
}
```

### Opção 3: Sem Sidebar Direita

```tsx
import { FlexibleLayout } from '@/components/layout/flexible-layout'

export default function Page() {
  return (
    <FlexibleLayout showRightSidebar={false}>
      {/* Conteúdo em largura total */}
    </FlexibleLayout>
  )
}
```

### Opção 4: Sidebar Customizada

```tsx
import { FlexibleLayout } from '@/components/layout/flexible-layout'

function MinhaSidebar() {
  return (
    <div className="p-4">
      <h2>Minha Sidebar</h2>
      {/* Conteúdo customizado */}
    </div>
  )
}

export default function Page() {
  return (
    <FlexibleLayout rightSidebar={<MinhaSidebar />}>
      {/* Seu conteúdo */}
    </FlexibleLayout>
  )
}
```

---

## 🌐 URLs de Teste

Acesse as seguintes URLs para testar:

| Página | URL | Descrição |
|--------|-----|-----------|
| Dashboard | `/dashboard` | Métricas e visão geral |
| Projetos | `/projetos` | Lista de projetos |
| Documentos | `/documentos` | Gerenciamento de docs |
| Equipe | `/equipe` | Membros da equipe |
| Configurações | `/configuracoes` | Configurações do sistema |
| **Exemplo Flexível** | `/exemplo-flexivel` | **Demo do layout flexível** ⭐ |

---

## 🎨 Personalização

### Modificar Menu da Sidebar Esquerda

Edite o array `menuItems` em:
- `three-column-layout.tsx` (linha ~35)
- `flexible-layout.tsx` (linha ~27)

```tsx
const menuItems = [
  {
    title: 'Meu Item',
    icon: MeuIcone,
    url: '/minha-rota',
  },
]
```

### Criar Nova Sidebar Direita

1. Crie arquivo em `src/components/layout/sidebars/minha-sidebar.tsx`
2. Exporte em `src/components/layout/sidebars/index.ts`
3. Use no FlexibleLayout

---

## 🧩 Componentes Shadcn Instalados

- ✅ `sidebar` (principal)
- ✅ `button`
- ✅ `card`
- ✅ `input`
- ✅ `label`
- ✅ `badge`
- ✅ `progress`
- ✅ `scroll-area`
- ✅ `separator`
- ✅ `avatar`
- ✅ `switch`
- ✅ `tabs`

---

## 💡 Dicas

1. **Use FlexibleLayout** para novos projetos (mais versátil)
2. **ThreeColumnLayout** é bom quando documentos são sempre necessários
3. **Componentes de Sidebar são reutilizáveis** - use em múltiplas páginas
4. **Cada página pode ter uma sidebar diferente** - máxima flexibilidade
5. **Sidebar pode ser ocultada** quando não necessária

---

## 🔍 Próximos Passos

1. Teste as páginas existentes em `/dashboard`, `/projetos`, etc.
2. Veja o exemplo completo em `/exemplo-flexivel`
3. Crie sua primeira página usando FlexibleLayout
4. Personalize os componentes de sidebar conforme necessário
5. Adicione seus próprios dados e funcionalidades

---

## 📚 Documentação Completa

- `IMPLEMENTACAO_COMPLETA.md` - Documentação detalhada
- `LAYOUT_DOCS.md` - Guia técnico do layout
- Código-fonte - Todos os arquivos estão bem comentados

---

**Desenvolvido com Shadcn UI + Next.js 15**
