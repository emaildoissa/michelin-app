# 🔧 Michelin App - Sistema de Gerenciamento de Oficina Mecânica

Sistema web desenvolvido para gerenciamento de oficinas mecânicas com **backend Node.js/Express**, **frontend React/Vite** e **banco de dados PostgreSQL**, tudo containerizado com **Docker**.

---

## 📋 **Índice**

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Executar](#-como-executar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Rotas da API](#-rotas-da-api)
- [Deploy na VPS](#-deploy-na-vps)
- [Troubleshooting](#-troubleshooting)
- [Licença](#-licença)

---

## 🚀 **Tecnologias**

### **Frontend**
- ⚛️ React 19 + TypeScript
- ⚡ Vite (build tool)
- 🎨 Material-UI (MUI) v6
- 🔄 React Router DOM v7
- 📊 Chart.js / Recharts (para gráficos opcionais)

### **Backend**
- 🟢 Node.js 20 (Alpine)
- 📘 Express.js
- 🗄️ PostgreSQL 16
- 🔐 Cors + Dotenv

### **DevOps**
- 🐳 Docker & Docker Compose
- 🌐 Nginx (reverse proxy/static serve)
- 📦 Multi-stage builds (otimizado)

---

## ✅ **Pré-requisitos**

- **Docker Desktop** (versão 24+)
- **Docker Compose** (versão 2.0+)
- **Git** (para clonar repositório)
- **Node.js 20+** (opcional, apenas se rodará localmente sem Docker)

### **Verificar instalação:**
```bash
docker --version
docker-compose --version
git --version


🔧 Instalação1. Clonar o repositóriobash12git clone https://github.com/emaildoissa/michelin-app.git
cd michelin-app2. Configurar variáveis de ambienteO arquivo .env já existe com valores padrão. Se quiser personalizar:bash12cp .env .env.local
# Edite .env.local conforme necessário▶️ Como ExecutarModo Desenvolvimento (com Docker)bash1234# Inicia todos os containers (frontend + backend + banco)
npm run dev:build

# Aguarde ~2 minutos para tudo inicializarEntão acesse:
Frontend: http://localhost:5173
Backend: http://localhost:5000
API Health Check: http://localhost:5000/api/health
Modo Desenvolvimento (sem Docker - Local)Se preferir rodar localmente (requer Node.js + PostgreSQL instalados):bash123456789101112# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: PostgreSQL (separadamente)
# Configure as variáveis no .envParar os containersbash12npm run stop          # Para os containers (dados persistem)
npm run stop:clean    # Para e deleta volumes (cuidado!)Ver logs em tempo realbash1234npm run logs          # Todos os containers
npm run logs:backend  # Apenas backend
npm run logs:frontend # Apenas frontend
npm run logs:db       # Apenas banco de dados📁 Estrutura do Projetotextmichelin-app/
├── frontend/                    # React + Vite (SSR/CSR)
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas (Dashboard, Clientes, etc)
│   │   ├── App.tsx              # Root da aplicação
│   │   └── main.tsx             # Entry point
│   ├── Dockerfile               # Build multi-stage React
│   ├── nginx.conf               # Configuração Nginx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── server.ts            # Servidor Express
│   │   ├── db.ts                # Conexão PostgreSQL
│   │   └── routes/              # Rotas da API (será criado)
│   ├── Dockerfile               # Build multi-stage Node.js
│   ├── init.sql                 # Schema do banco
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml           # Orquestra todos os containers
├── .env                         # Variáveis (desenvolvimento)
├── .env.production              # Variáveis (produção/VPS)
├── .gitignore                   # Ignora node_modules, .env, dist
├── package.json                 # Scripts raiz
└── README.md                    # Este arquivo🔐 Variáveis de Ambiente.env (Desenvolvimento)env12345678910111213# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=michelin_app

# Backend
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173.env.production (VPS)env12345678910111213# Database
DB_USER=michelin_user
DB_PASSWORD=sua_senha_segura_gerada
DB_HOST=db
DB_PORT=5432
DB_NAME=michelin_app

# Backend
PORT=5000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://seu-dominio.com.br🔌 Rotas da APIHealth CheckGET /api/healthResposta:json12345{
  "status": "OK",
  "timestamp": "2026-04-10T10:30:00Z",
  "database": "conectado"
}Teste de Banco de DadosGET /api/db-testResposta:json12345{
  "status": "OK",
  "database": "Conectado com sucesso",
  "timestamp": "2026-04-10 10:30:00.123456"
}
Rotas CRUD (clientes, veículos, serviços, peças, ordens de serviço) serão criadas no Passo 2
🚀 Deploy na VPS (Locaweb 2GB)Pré-requisitos na VPSbash123456789# SSH na VPS
ssh seu_usuario@seu_ip_vps

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USERClonar e Configurarbash1234567cd /opt
sudo git clone https://github.com/emaildoissa/michelin-app.git
cd michelin-app

# Copiar .env.production e editar com dados seguros
sudo cp .env.production .env
sudo nano .envIniciar com Docker Composesudo docker-compose up -dVerificar Statusbash12docker ps
docker-compose logs🐛 TroubleshootingErro: "Cannot connect to Docker daemon"bash1234# Certifique-se que Docker está rodando
sudo systemctl start docker

# Ou no Mac/Windows, abra o Docker DesktopErro: "Port 5432 already in use"bash12# Mude a porta no .env ou pare outro PostgreSQL
sudo docker-compose downErro: "Connection refused" no backendbash12# Aguarde o banco inicializar (~30 segundos)
docker-compose logs dbErro: "Frontend não consegue acessar API"bash123# Verifique CORS no backend
# Edite backend/src/server.ts:
# origin: process.env.FRONTEND_URL || 'http://localhost:5173'📝 LicençaMIT License - Veja o arquivo LICENSE para detalhes.👨‍💻 AutorMarcos Fernando de Andrade
GitHub: @emaildoissa
