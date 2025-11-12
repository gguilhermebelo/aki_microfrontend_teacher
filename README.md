# AKI! Microfrontend do Professor

Aplicação em React + TypeScript para professores gerirem turmas, eventos de presença e dados de alunos.

## 👩‍🎓 Alunos
Camila Delarosa  
Dimitri Delinski  
Guilherme Belo  
Yasmin Carmona

## 🎯 Overview

A interface do professor permite:
- Autenticar com segurança (JWT via API Gateway)
- Gerenciar turmas e matrículas de alunos
- Criar e controlar eventos de presença
- Corrigir presenças manualmente
- Gerar QR Codes para registro de presença
- Visualizar relatórios e métricas
- Exportar dados de presença

## 🛠 Stack

- **Linguagem:** TypeScript
- **Framework:** React 18 + Vite
- **Rotas:** React Router DOM v6
- **UI:** TailwindCSS + shadcn/ui
- **Estado:** Zustand
- **HTTP:** Axios
- **Formulários:** React Hook Form + Zod
- **Autenticação:** JWT via API Gateway
- **Arquitetura:** Clean Architecture + Vertical Slice

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Setup global da aplicação
├── features/               # Módulos por funcionalidade (Vertical Slice)
│   ├── auth/              # Autenticação
│   ├── dashboard/         # Painel
│   ├── classes/           # Gestão de turmas
│   ├── events/            # CRUD de eventos
│   ├── attendances/       # Presenças
│   └── reports/           # Relatórios e métricas
├── shared/                # Recursos compartilhados
│   ├── components/        # Componentes reutilizáveis
│   ├── hooks/             # Hooks customizados
│   ├── utils/             # Funções utilitárias
│   └── types/             # Tipos TypeScript
├── services/              # Serviços externos
│   ├── http/              # Configuração Axios
│   ├── auth/              # Serviço de auth
│   └── storage/           # Persistência local
└── styles/                # Estilos globais
```

## 🧱 Arquitetura do Código-Fonte

A aplicação segue um modelo híbrido entre Vertical Slice e Clean Architecture para manter baixo acoplamento e alta coesão:

**Camadas principais:**
- `features/` (Vertical Slice): Cada domínio (classes, events, attendance, auth) encapsula UI, lógica e integrações específicas.
- `services/`: Abstrações de infraestrutura (HTTP/Axios, auth/localStorage, BFF orchestration). Nada de lógica de UI aqui.
- `shared/`: Componentes, tipos, hooks e utilitários reutilizáveis – nunca importam código de uma slice específica.
- `app/`: Bootstrapping (rotas, provedores globais, estilos) e configuração cruzada.

**Fluxo de dados (request):** Componente → Hook/ação local → `services/bff/*` → Axios (`services/http/axios.ts`) → BFF → resposta normalizada → UI/toast.

**Princípios aplicados:**
- Separação de responsabilidades (SRP) – cada arquivo tem um papel claro.
- Dependências apontam de fora para dentro (UI → serviço), nunca o contrário.
- Zero lógica de negócio complexa dentro de componentes de apresentação.
- Liskov/Interface Segregation via tipos compartilhados em `shared/types`.
- Testabilidade: serviços e funções puras podem ser isoladas em futuros testes sem envolver React.

**Env Runtime vs Build:**
Variáveis como `VITE_STUDENT_APP_URL` são injetadas em runtime via `env.js` para permitir apontar para outro microfrontend sem rebuild. O Axios usa prioridade: `window.__ENV` → `import.meta.env` → fallback local.

**Motivos das escolhas:**
- Vertical Slice reduz refactors em larga escala quando um domínio muda.
- Runtime env evita pipeline pesado para trocar URL do microfrontend do estudante.
- Orquestração no BFF simplifica frontend (menos chamadas e junções).

**Pontos de extensão futuros:**
- Adicionar camada de cache para eventos/attendance.
- Introduzir React Query caso haja complexidade de invalidação.
- Testes unitários em serviços (ex.: `teacherBff.ts`).

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm
- Navegador moderno

### Instalação

1. Clonar repositório:
```bash
git clone <repository-url>
cd aki-teacher-frontend
```

2. Instalar dependências:
```bash
npm install
```

3. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

Editar `.env` com a URL do API Gateway:
```env
VITE_APP_ENV=development
VITE_API_BASE_URL=https://bff.api.aki.example/v1
VITE_AUTH_TOKEN_STORAGE_KEY=aki_token
```

4. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

The application will be available at `http://localhost:5174` (porta fixa definida em `vite.config.ts`). Use `strictPort: true` garante falha explícita se já estiver ocupada.

### Build Produção

```bash
npm run build
```

Arquivos gerados estarão em `dist/`.

## 🐳 Docker

### Build da Imagem

```bash
docker build -t aki-teacher-frontend .
```

### Executar Container

```bash
docker run -p 5174:80 \
  -e VITE_API_BASE_URL=https://your-api.com/v1 \
  -e VITE_STUDENT_APP_URL=https://student.example.com \
  aki-teacher-frontend
```

> Em runtime o script `docker-entrypoint.sh` gera `env.js` com `window.__ENV.VITE_STUDENT_APP_URL`, permitindo alterar a URL do microfrontend do estudante sem rebuild.

## 🎨 Design System

Paleta educativa:
- Primária: Amarelo Dourado (#FFD700)
- Secundária: Marrom Sienna (#A0522D)
- Fundo: Branco (#FFFFFF)

Princípios: gradientes suaves, transições fluídas, layout em cards, responsivo mobile-first e tokens sem cores hard-coded.

## 🔐 Autenticação

Fluxo JWT:
1. Login via `/login` (email/senha) no API Gateway.
2. Gateway retorna JWT.
3. Token salvo em `localStorage`.
4. Requisições usam `Authorization: Bearer <token>`.
5. Expiração redireciona para login.

## 📡 Integração com API

Chamadas passam pelo API Gateway:
- Base configurada em `VITE_API_BASE_URL`.
- Interceptores Axios adicionam token e tratam erros.
- Refresh/renovação ou logout em falhas de auth.

### Endpoints Principais
- `POST /auth/login` - Autenticação
- `GET /teachers/me` - Perfil
- `GET /teachers/me/classes` - Turmas do professor
- `POST /events` - Criar evento presença
- `GET /events/:id/qr` - QR Code do evento
- `POST /attendances` - Correção manual
- `GET /reports/attendance/event/:id` - Relatório de presença

## 🧩 Funcionalidades

### Dashboard
- Boas-vindas e info do professor
- KPIs rápidos (turmas, eventos, presenças)
- Feed de atividades
- Ações rápidas

### Turmas
- Listar turmas
- Detalhes e alunos
- Gerir dispositivos de alunos
- Reset de associações

### Eventos
- Criar, editar, excluir
- Gerar QR Code
- Status (ativo/fechado/cancelado)

### Presenças
- Correção manual
- Busca e marcação de alunos
- Histórico
- Exportação

### Relatórios
- Filtro por evento ou turma
- Sumário estatístico
- Exportar CSV/Excel
- Tendências

## 🧪 Desenvolvimento

### Qualidade de Código
- TS strict mode
- ESLint
- Vertical Slice
- SOLID / Clean Architecture

### Estado
- Zustand (global)
- React Query (opcional server state)
- Estado local para UI

### Formulários
- React Hook Form
- Zod (schemas)
- Tipagem segura

## 📱 Responsividade

Aplicação totalmente responsiva:
- Mobile-first
- Layout otimizado tablet/desktop
- Interações touch-friendly
- Navegação inferior (mobile) / lateral (desktop)

## 🔒 Segurança
- Autenticação JWT
- Rotas protegidas
- Tratamento de expiração
- Comunicação segura (HTTPS)
- Validação de entrada com Zod

## 🌍 Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `VITE_APP_ENV` | Ambiente | `development` |
| `VITE_API_BASE_URL` | Base do API Gateway | `http://localhost:3000/v1` |
| `VITE_AUTH_TOKEN_STORAGE_KEY` | Chave localStorage do token | `aki_token` |

## 📄 Licença

Parte do sistema AKI! (uso interno).

## Autores
Camila Delarosa  
Dimitri Delinski  
Guilherme Belo  
Yasmin Carmona

## Suporte
Para dúvidas ou problemas, contate o time de desenvolvimento.
