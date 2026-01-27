# Status Bar - Documentação

## Visão Geral

A Status Bar é um componente estilo Vivaldi browser que fica na parte inferior do workspace e fornece informações e controles importantes para o usuário.

![Status Bar Preview](https://i.imgur.com/placeholder.png)

## Recursos

A Status Bar inclui os seguintes recursos:

### 1. **Breadcrumbs** (Esquerda)
- Mostra o caminho de navegação da janela ativa
- Formato: `Workspace > Documento > Modo`
- Atualiza automaticamente com base na aba ativa

### 2. **Status Message** (Centro)
- Exibe mensagens sobre o que está acontecendo
- Tipos de status:
  - `idle` - Estado normal (ícone Info, cinza)
  - `loading` - Carregando (ícone animado, azul)
  - `success` - Sucesso (check verde)
  - `error` - Erro (X vermelho)
  - `warning` - Aviso (! amarelo)

### 3. **Controles** (Direita)

#### Modo de Divisão
- Dropdown com 3 opções:
  - **Janela única** - Uma coluna
  - **Dividir horizontal** - Duas colunas lado a lado
  - **Dividir vertical** - Três colunas

#### Toggle Light/Dark Mode
- Alterna entre modo claro e escuro
- Ícone muda (Sol/Lua)

#### Zoom Controls
- Botões `-` e `+` para diminuir/aumentar zoom
- Slider de 50% a 200%
- Clique no valor (%) para resetar para 100%
- Incrementos de 10%

## Como Usar

### No seu componente

```tsx
import { useStatusBar } from '@/hooks/use-status-bar'

function MyComponent() {
  const { setLoading, setSuccess, setError, setWarning } = useStatusBar()
  
  const handleSave = async () => {
    setLoading('Salvando documento...')
    
    try {
      await saveDocument()
      setSuccess('Documento salvo com sucesso!')
    } catch (error) {
      setError('Falha ao salvar documento')
    }
  }
  
  return (
    <button onClick={handleSave}>Salvar</button>
  )
}
```

### API do Hook

```tsx
const {
  setStatus,    // Controle manual completo
  setLoading,   // Mostra status de carregamento
  setSuccess,   // Mostra status de sucesso (auto-limpa em 2s)
  setError,     // Mostra status de erro (auto-limpa em 3s)
  setWarning,   // Mostra status de aviso (auto-limpa em 2.5s)
  clearStatus   // Limpa o status manualmente
} = useStatusBar()
```

### Exemplos de Uso

#### 1. Upload de Arquivo
```tsx
const handleUpload = async (file: File) => {
  setLoading('Enviando arquivo...')
  
  try {
    await uploadFile(file)
    setSuccess('Arquivo enviado com sucesso!')
  } catch (error) {
    setError('Falha no upload do arquivo')
  }
}
```

#### 2. Busca/Pesquisa
```tsx
const handleSearch = async (query: string) => {
  if (!query) {
    setWarning('Digite algo para pesquisar')
    return
  }
  
  setLoading('Buscando...')
  const results = await search(query)
  setSuccess(`${results.length} resultados encontrados`)
}
```

#### 3. Operação Longa
```tsx
const processData = async () => {
  setLoading('Processando dados... Isso pode levar alguns minutos')
  
  try {
    await longRunningTask()
    setSuccess('Processamento concluído!', 5000) // Mostra por 5 segundos
  } catch (error) {
    setError('Erro no processamento', 5000)
  }
}
```

#### 4. Controle Manual
```tsx
// Status customizado com duração específica
setStatus('Conectando ao servidor...', 'loading', 10000) // 10 segundos

// Status sem auto-limpar
setStatus('Modo offline ativo', 'warning')

// Limpar manualmente depois
setTimeout(() => clearStatus(), 5000)
```

## Integração

A Status Bar já está integrada no `WorkspaceLayout` e funciona automaticamente com:

- **Breadcrumbs** - Atualiza com base na aba ativa
- **Zoom** - Estado local por workspace
- **Split Mode** - Conectado ao sistema de splits do workspace
- **Theme** - Conectado ao sistema de temas do Next.js

## Personalização

### Mudar Duração Padrão

```tsx
// No hook use-status-bar.ts
setSuccess: (message, duration = 2000) => { // Altere aqui
  // ...
}
```

### Adicionar Novo Tipo de Status

1. Adicione o tipo em `StatusBarProps`:
```tsx
statusType?: 'idle' | 'loading' | 'success' | 'error' | 'warning' | 'info'
```

2. Adicione o ícone em `getStatusIcon()`:
```tsx
case 'info':
  return <InfoIcon weight="fill" className="h-3.5 w-3.5 text-blue-400" />
```

3. Adicione a cor no componente:
```tsx
statusType === 'info' && "text-blue-400"
```

## Atalhos de Teclado (Futuro)

Planejado para futuras versões:
- `Ctrl/Cmd + +` - Aumentar zoom
- `Ctrl/Cmd + -` - Diminuir zoom
- `Ctrl/Cmd + 0` - Resetar zoom
- `Ctrl/Cmd + \` - Toggle split

## Acessibilidade

- Todos os botões têm tooltips descritivos
- Suporte completo a teclado
- Cores de status com contraste adequado
- Slider acessível por teclado

## Troubleshooting

### Status não atualiza
```tsx
// Certifique-se de importar o hook correto
import { useStatusBar } from '@/hooks/use-status-bar' // ✅
import { useStatusBarStore } from '@/hooks/use-status-bar' // ❌ (use apenas para acessar state diretamente)
```

### Status desaparece muito rápido
```tsx
// Especifique uma duração personalizada
setSuccess('Mensagem', 5000) // 5 segundos
```

### Múltiplas mensagens ao mesmo tempo
```tsx
// O último setStatus sempre sobrescreve o anterior
// Para mostrar múltiplas mensagens, use uma fila (implementação futura)
```

## Roadmap

- [ ] Fila de mensagens
- [ ] Histórico de status (clique para ver)
- [ ] Atalhos de teclado
- [ ] Mensagens toast simultâneas
- [ ] Status por workspace (independentes)
- [ ] Barra de progresso para operações longas
- [ ] Sons/notificações opcionais
