# Como Usar o Editor Tiptap - Guia Rápido

## Acessando o Editor

### Opção 1: Criar Novo Documento
1. Navegue para `/documentos`
2. Clique no botão **"Novo Documento"**
3. Comece a escrever!

### Opção 2: A partir da Página Notion
1. Navegue para `/notion`
2. Clique em **"Novo Documento"**
3. Comece a escrever!

### Opção 3: Editar no Workspace
1. No workspace, abra um documento
2. Clique em **"Edit Mode"**
3. Comece a editar!

## Funcionalidades Principais

### 1. Comando / (Slash)

Digite `/` em qualquer lugar para abrir o menu de comandos:

```
/ → Menu aparece
```

**Comandos disponíveis:**
- `/text` - Texto normal
- `/h1` - Título grande
- `/h2` - Título médio
- `/h3` - Título pequeno
- `/bullet` - Lista com marcadores
- `/number` - Lista numerada
- `/todo` - Lista de tarefas
- `/quote` - Citação
- `/code` - Bloco de código
- `/table` - Inserir tabela
- `/divider` - Linha separadora

**Exemplo de uso:**
```
Digite: /h1
Resultado: Cria um Heading 1
```

### 2. Menções @ (At)

Digite `@` para mencionar pessoas, páginas ou datas:

```
@ → Menu de menções aparece
```

**Tipos de menções:**
- `@Nathan` - Menciona usuário
- `@Technical` - Menciona documento
- `@Today` - Menciona data

**Exemplo de uso:**
```
Digite: @Nathan
Resultado: @Nathan Castro aparece como menção
```

### 3. Formatação de Texto

#### Via Toolbar (Barra de Ferramentas)

A barra superior tem todos os botões:

```
[Normal ▼] [B] [I] [U] [S] [</>] [A▼] [⚡] [•] [1.] [☑] [←] [→] [↓]
```

- **B** = Negrito
- **I** = Itálico  
- **U** = Sublinhado
- **S** = Riscado
- **</>** = Código
- **A▼** = Cor do texto
- **⚡** = Destacar (highlight)
- **•** = Lista com marcador
- **1.** = Lista numerada
- **☑** = Lista de tarefas
- **Alinhamento** = Esquerda, Centro, Direita, Justificado

#### Via Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl + B` | **Negrito** |
| `Cmd/Ctrl + I` | *Itálico* |
| `Cmd/Ctrl + U` | <u>Sublinhado</u> |
| `Cmd/Ctrl + Shift + X` | ~~Riscado~~ |
| `Cmd/Ctrl + E` | `Código` |
| `Cmd/Ctrl + K` | Inserir link |
| `Cmd/Ctrl + S` | **Salvar** |

### 4. Bubble Menu (Menu Flutuante)

Selecione qualquer texto e um menu aparece automaticamente:

```
Selecione texto → [B] [I] [U] [S] [</>] [🔗] [⚡]
```

Perfeito para formatação rápida!

### 5. Listas

#### Lista com Marcadores
```
Digite: /bullet
Ou clique no ícone •
```

#### Lista Numerada
```
Digite: /number
Ou clique no ícone 1.
```

#### Lista de Tarefas (To-do)
```
Digite: /todo
Ou clique no ícone ☑

Resultado:
- [ ] Tarefa 1
- [ ] Tarefa 2
- [x] Tarefa 3 (completa)
```

### 6. Tabelas

#### Criar Tabela
```
Digite: /table
Ou: Toolbar → Ícone de tabela

Resultado: Tabela 3x3 com cabeçalho
```

#### Editar Tabela
- Clique em qualquer célula para editar
- Use Tab para navegar entre células
- Redimensione arrastando as bordas

### 7. Blocos de Código

```
Digite: /code

Resultado:
```javascript
console.log('Hello World')
```
```

O código tem syntax highlighting automático para:
- JavaScript/TypeScript
- Python
- HTML/CSS
- E muitas outras linguagens

### 8. Imagens

```
Toolbar → Ícone de imagem
Digite a URL da imagem
Pressione OK

Resultado: Imagem inserida e responsiva
```

### 9. Links

```
Cmd/Ctrl + K
Ou: Selecione texto → Bubble menu → Link
Digite a URL
Pressione OK

Resultado: [Texto com link](https://exemplo.com)
```

### 10. Citações

```
Digite: /quote

Resultado:
> Esta é uma citação
> Pode ter várias linhas
```

### 11. Divisor

```
Digite: /divider

Resultado:
---
(linha horizontal)
```

## Salvando seu Trabalho

### Auto-Save
- **Ativado por padrão**
- Salva automaticamente 2 segundos após parar de digitar
- Veja o status no rodapé do editor

### Save Manual
```
Cmd/Ctrl + S
Ou: Toolbar → Botão de Download
```

### Ver Status
```
Rodapé do editor:
"123 characters · 45 words"
"Last saved: 2 minutes ago"
```

## Exportando Documentos

1. Clique no botão **"Export"** no topo
2. Escolha o formato:
   - **Markdown** (.md) - Formato texto
   - **JSON** (.json) - Formato estruturado

## Modo Visualização vs Edição

### No Document View:
- **View Mode** - Apenas visualizar
- **Edit Mode** - Editar o documento

Alternar entre os modos:
```
Botão "Edit Mode" / "View Mode" no topo
```

## Dicas e Truques

### 1. Navegação Rápida
```
/ → Abre menu de comandos
@ → Abre menu de menções
Tab → Indenta lista/tabela
Shift+Tab → Remove indentação
```

### 2. Seleção de Texto
```
Cmd/Ctrl + A → Seleciona tudo
Shift + Setas → Seleciona texto
Duplo clique → Seleciona palavra
Triplo clique → Seleciona parágrafo
```

### 3. Undo/Redo
```
Cmd/Ctrl + Z → Desfazer
Cmd/Ctrl + Shift + Z → Refazer
```

### 4. Copiar Formatação
1. Selecione texto formatado
2. Copie (Cmd/Ctrl + C)
3. Cole (Cmd/Ctrl + V)
4. A formatação é preservada!

### 5. Múltiplas Linhas
```
Digite normalmente e pressione Enter
Shift + Enter → Quebra de linha sem parágrafo novo
```

## Exemplos Práticos

### Exemplo 1: Criar Nota de Reunião

```
1. Digite: /h1 → "Reunião de Planejamento"
2. Digite: /h2 → "Participantes"
3. Digite: @ → Selecione pessoas
4. Digite: /h2 → "Agenda"
5. Digite: /number → Crie lista numerada
6. Digite: /h2 → "Ações"
7. Digite: /todo → Crie checklist
```

### Exemplo 2: Documentação Técnica

```
1. Digite: /h1 → "Documentação da API"
2. Digite: /h2 → "Instalação"
3. Digite: /code → Adicione código
4. Digite: /h2 → "Exemplos"
5. Digite: /table → Crie tabela de referência
6. Digite: /quote → Adicione avisos importantes
```

### Exemplo 3: Artigo/Post

```
1. Digite: /h1 → "Título do Artigo"
2. Escreva introdução
3. Digite: /h2 → "Primeira Seção"
4. Use formatação: Negrito, Itálico
5. Digite: /bullet → Crie lista de pontos
6. Adicione imagens com toolbar
7. Digite: /divider → Separe seções
```

## Perguntas Frequentes

### Como adicionar cores ao texto?
```
Selecione texto → Toolbar → Ícone A com barra colorida
Escolha uma cor
```

### Como destacar (highlight) texto?
```
Selecione texto → Toolbar → Ícone de caneta marca-texto
Ou: Cmd/Ctrl + Shift + H
```

### Como fazer texto menor/maior?
```
Use os headings:
/h1 = Muito grande
/h2 = Grande
/h3 = Médio
Normal = Padrão
```

### Como alinhar texto?
```
Toolbar → Botões de alinhamento
Ou selecione texto → Alinhamento
```

### O editor funciona offline?
```
Sim! Os documentos são salvos localmente no navegador.
```

### Como compartilhar um documento?
```
Botão "Share" no topo (funcionalidade em desenvolvimento)
Ou: Export → Envie o arquivo
```

### Posso usar em dispositivos móveis?
```
Sim! O editor é totalmente responsivo.
Toque e arraste para selecionar texto.
```

## Suporte a Markdown

O editor suporta **toda a sintaxe Markdown**:

```markdown
# Heading 1
## Heading 2
### Heading 3

**negrito** ou __negrito__
*itálico* ou _itálico_
~~riscado~~
`código`

- Lista
- Com marcadores

1. Lista
2. Numerada

- [ ] To-do
- [x] Completo

> Citação

```code
Bloco de código
```

[Link](https://exemplo.com)
![Imagem](url.jpg)

---
Divisor
```

## Começando Agora!

1. Navegue para `/documentos/new`
2. Digite `/` para ver todos os comandos
3. Experimente diferentes formatações
4. Use `@` para menções
5. Salve com `Cmd/Ctrl + S`

**Divirta-se editando!** ✨

## Atalhos Completos - Referência Rápida

| Atalho | Ação |
|--------|------|
| `/` | Menu de comandos |
| `@` | Menu de menções |
| `Cmd/Ctrl + B` | Negrito |
| `Cmd/Ctrl + I` | Itálico |
| `Cmd/Ctrl + U` | Sublinhado |
| `Cmd/Ctrl + Shift + X` | Riscado |
| `Cmd/Ctrl + E` | Código inline |
| `Cmd/Ctrl + K` | Link |
| `Cmd/Ctrl + Shift + H` | Highlight |
| `Cmd/Ctrl + S` | Salvar |
| `Cmd/Ctrl + Z` | Desfazer |
| `Cmd/Ctrl + Shift + Z` | Refazer |
| `Tab` | Indentar |
| `Shift + Tab` | Remover indentação |
| `Enter` | Nova linha/parágrafo |
| `Shift + Enter` | Quebra de linha |

---

**Pronto! Você já sabe tudo o que precisa para usar o editor como um profissional!** 🚀
