# Vellum Frontend

Interface React + Vite + Fabric.js para o Vellum Editor.

## Stack
- **React 18** + **Vite**
- **Fabric.js** (canvas editor — estilo Canva)
- **PDF.js** (importar e renderizar PDFs)
- **jsPDF** (exportar documentos como PDF)
- **Tailwind CSS** (estilização)
- **Supabase Auth** (autenticação)
- **Stripe.js** (pagamentos)
- **Zustand** (gerenciamento de estado)
- **React Router v6**

---

## Setup Local

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas credenciais reais
```

### 3. Iniciar em desenvolvimento
```bash
npm run dev
# Acesse: http://localhost:5173
```

### 4. Build para produção
```bash
npm run build
# Os arquivos ficam em /dist
```

---

## Deploy no Render (Static Site)

1. Crie uma conta em https://render.com
2. New → **Static Site**
3. Conecte seu repositório GitHub
4. Configurações:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Adicione as variáveis do `.env` em **Environment Variables**

> **Importante**: Configure o Redirect/Rewrite para SPA:
> - Source: `/*`
> - Destination: `/index.html`
> - Type: Rewrite

---

## Funcionalidades do Editor

### Ferramentas
| Tecla | Ferramenta |
|-------|-----------|
| V | Selecionar/Mover |
| T | Adicionar texto |
| I | Adicionar imagem |
| R | Retângulo |
| C | Círculo |
| L | Linha |
| H | Mover canvas (pan) |

### Atalhos
| Atalho | Ação |
|--------|------|
| Ctrl+S | Salvar |
| Ctrl+Z | Desfazer |
| Ctrl+Y / Ctrl+Shift+Z | Refazer |
| Ctrl+D | Duplicar seleção |
| Delete | Remover selecionado |
| Alt + Arrastar | Mover o canvas (pan) |
| Scroll do mouse | Zoom in/out |

### Editor de PDF
1. Clique em **Upload (PDF)** no painel esquerdo
2. Selecione um arquivo PDF
3. Cada página é renderizada como fundo editável
4. Adicione textos, imagens, formas em cima
5. Exporte como PDF

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── Common/          # Logo, Button
│   ├── Editor/          # Canvas, Toolbar, Painéis
│   └── Layout/          # Header
├── context/             # ThemeContext
├── lib/                 # supabase.js, api.js
├── pages/               # HomePage, DashboardPage, EditorPage, etc.
└── store/               # editorStore.js (Zustand)
```
