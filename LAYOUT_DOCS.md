# Layout de Três Colunas - Documentação

## Visão Geral

Este projeto implementa um layout de três colunas usando componentes Shadcn UI:

- **Sidebar Esquerda**: Navegação principal do aplicativo
- **Conteúdo Central**: Área modular que muda conforme a navegação
- **Sidebar Direita**: Painel de visualização de documentos

## Estrutura de Arquivos

```
src/
├── components/
│   ├── layout/
│   │   └── three-column-layout.tsx    # Componente principal do layout
│   └── ui/                             # Componentes Shadcn UI
└── app/
    └── (dashboard)/
        ├── dashboard/
        │   └── page.tsx                # Página Dashboard
        ├── projetos/
        │   └── page.tsx                # Página Projetos
        └── documentos/
            └── page.tsx                # Página Documentos
```

## Como Usar

### 1. Importar o Layout

Importe o componente `ThreeColumnLayout` em qualquer página:

```tsx
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'

export default function MinhaPage() {
  return (
    <ThreeColumnLayout>
      {/* Seu conteúdo aqui */}
    </ThreeColumnLayout>
  )
}
```

### 2. Personalizar a Sidebar Esquerda

Edite o array `menuItems` em `three-column-layout.tsx`:

```tsx
const menuItems = [
  {
    title: 'Meu Item',
    icon: IconeDoLucide,
    url: '/minha-rota',
  },
  // ... mais itens
]
```

### 3. Personalizar a Sidebar Direita

Modifique o array `documentosRecentes` ou substitua completamente a seção da sidebar direita com seu próprio componente.

## Componentes Shadcn Utilizados

Os seguintes componentes foram instalados e estão sendo usados:

- `sidebar` - Componente principal de sidebar
- `card` - Cards para exibição de conteúdo
- `button` - Botões de ação
- `input` - Campos de entrada
- `badge` - Badges de status
- `progress` - Barras de progresso
- `scroll-area` - Área de rolagem personalizada
- `separator` - Separadores visuais
- `avatar` - Avatar de usuário

## Rotas Disponíveis

- `/dashboard` - Página principal com métricas e visão geral
- `/projetos` - Lista de projetos
- `/documentos` - Gerenciamento de documentos
- `/equipe` - Gerenciamento de equipe (a ser implementado)
- `/configuracoes` - Configurações (a ser implementado)

## Recursos

### Sidebar Esquerda
- Menu de navegação principal
- Botão "Novo Projeto"
- Informações do usuário no rodapé
- Estado ativo baseado na rota atual
- Colapsável (via SidebarProvider do Shadcn)

### Conteúdo Central
- Totalmente modular
- Responsivo
- Container centralizado com padding
- Troca de conteúdo baseada em roteamento

### Sidebar Direita
- Lista de documentos recentes
- Preview de documento selecionado
- Botões de ação (Abrir, Download)
- ScrollArea para listas longas
- Interface fixa de 320px de largura

## Personalizações Futuras

Para adicionar novas funcionalidades:

1. **Nova Página**: Crie um novo arquivo em `src/app/(dashboard)/[nome]/page.tsx`
2. **Novo Item de Menu**: Adicione ao array `menuItems`
3. **Componentes da Sidebar Direita**: Crie componentes separados e importe-os no layout

## Exemplo de Nova Página

```tsx
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'

export default function NovaPage() {
  return (
    <ThreeColumnLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Minha Nova Página</h1>
        {/* Seu conteúdo aqui */}
      </div>
    </ThreeColumnLayout>
  )
}
```

## Tecnologias

- **Next.js 15** - Framework React
- **Shadcn UI** - Biblioteca de componentes
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **TypeScript** - Tipagem estática
