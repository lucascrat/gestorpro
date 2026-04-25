# 🚀 Guia de Configuração - Gestor

Siga este guia para configurar e rodar o projeto.

## 📋 Pré-requisitos

- **Node.js 20+**: [Download](https://nodejs.org)
- **Docker & Docker Compose** (recomendado): [Download](https://www.docker.com/products/docker-desktop)
- **Git**: Para controle de versão
- **Contas e Chaves**:
  - Gemini API Key: [Google AI Studio](https://aistudio.google.com/app/apikey)
  - EFI Pix Credentials: [EFI](https://www.efipay.com.br)

## 🐳 Opção 1: Docker Compose (Recomendado)

### 1.1 Clonar e Configurar

```bash
# Clonar repositório (se não tiver feito)
git clone <seu-repo> gestor
cd gestor

# Copiar arquivo de exemplo
cp .env.example .env
```

### 1.2 Preencher Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:

```env
# Database (não precisa alterar para teste local)
DB_USER=gestor
DB_PASSWORD=gestor123
DB_NAME=gestor_db

# IMPORTANTE: Altere estas
GEMINI_API_KEY=sua_chave_api_gemini_aqui
EFI_CLIENT_ID=seu_efi_client_id
EFI_CLIENT_SECRET=seu_efi_client_secret
EFI_WEBHOOK_URL=https://seu-dominio.com/api/webhooks/pix

# Credenciais do painel (admin do cms.startpainel.cc)
PANEL_ADMIN_USERNAME=seu_usuario
PANEL_ADMIN_PASSWORD=sua_senha

# URLs (ajuste se necessário)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 1.3 Iniciar Containers

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 1.4 Executar Migrations

```bash
# Criar tabelas no banco
docker-compose exec backend npm run migrate
```

### 1.5 Acessar Aplicação

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Admin**: http://localhost:3000/admin

---

## 💻 Opção 2: Instalação Local

### 2.1 Configurar Backend

```bash
cd backend

# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
nano .env  # ou use seu editor favorito
```

Variáveis importantes para o `.env` do backend:

```env
DATABASE_URL=postgresql://gestor:gestor123@localhost:5432/gestor_db
JWT_SECRET=seu_jwt_secret_aqui
GEMINI_API_KEY=sua_chave_gemini
EFI_CLIENT_ID=seu_efi_id
EFI_CLIENT_SECRET=seu_efi_secret
PANEL_ADMIN_USERNAME=seu_usuario_painel
PANEL_ADMIN_PASSWORD=sua_senha_painel
```

### 2.2 Instalar Dependências Backend

```bash
cd backend
npm install
```

### 2.3 Configurar Banco de Dados

```bash
# Se usar PostgreSQL local, crie um banco:
createdb gestor_db

# Ou use Docker apenas para o Postgres:
docker run --name gestor_postgres \
  -e POSTGRES_USER=gestor \
  -e POSTGRES_PASSWORD=gestor123 \
  -e POSTGRES_DB=gestor_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# Executar migrations
npm run migrate
```

### 2.4 Configurar Frontend

```bash
cd ../frontend

# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

Adicione:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2.5 Instalar Dependências Frontend

```bash
cd frontend
npm install
```

### 2.6 Iniciar Aplicação

Abra 2 terminais:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse:
- http://localhost:3000 (Frontend)
- http://localhost:3001 (Backend)

---

## 🧪 Testando a Aplicação

### 1. Acessar o Chat

1. Vá para http://localhost:3000
2. Clique em "💬 Iniciar Chat"
3. Digite uma mensagem, ex: "Olá"
4. A IA deve responder

### 2. Testar Pagamento

1. No chat, digite: "Quero renovar"
2. Um QR Code deve aparecer
3. (Em desenvolvimento, é mockado)

### 3. Criar Cliente Admin

1. Vá para http://localhost:3000/admin
2. Use qualquer email/senha para login (demo)
3. Clique "+ Novo Cliente"
4. Preencha:
   - Nome: Test User
   - Usuário Painel: test_user
   - Senha Painel: test123
   - Valor: 29.90
5. Clique "Criar Cliente"

---

## 🔑 Obter as Chaves API

### Gemini API Key

1. Vá para https://aistudio.google.com/app/apikey
2. Clique em "Get API Key"
3. Crie um novo projeto (se necessário)
4. Copie a chave
5. Paste em `GEMINI_API_KEY`

### EFI Pix

1. Cadastre-se em https://www.efipay.com.br
2. Vá para dashboard
3. Procure por "Credenciais" ou "API Keys"
4. Copie Client ID e Client Secret
5. Configure URLs de Webhook

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Se usando Docker Compose
docker-compose up postgres -d

# Verificar conexão
docker-compose exec backend npm run migrate
```

### Erro: "GEMINI_API_KEY is not defined"

- Verificar se `.env` foi preenchido corretamente
- Resetar containers: `docker-compose restart backend`

### Erro: "Cannot find module '@google/generative-ai'"

```bash
cd backend
npm install
npm run build
docker-compose restart backend
```

### Frontend não conecta ao Backend

- Verificar URL em `NEXT_PUBLIC_API_URL`
- Certificar que backend está rodando na porta 3001
- Verificar CORS no backend

### Playwright não consegue abrir navegador

```bash
# Instalar dependências do Playwright
cd backend
npx playwright install

# Reinstalar
npm install
```

---

## 📊 Estrutura de Diretórios

```
gestor/
├── backend/
│   ├── src/
│   │   ├── controllers/   ← Lógica das rotas
│   │   ├── services/      ← Gemini, EFI, Playwright
│   │   ├── models/        ← Tipos/Interfaces
│   │   ├── middleware/    ← Autenticação
│   │   ├── database/      ← Migrations
│   │   ├── config/        ← Configurações
│   │   └── index.ts       ← App principal
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── chat/          ← Interface de chat
│   │   ├── admin/         ← Dashboard admin
│   │   └── page.tsx       ← Home
│   ├── components/        ← Componentes React
│   ├── lib/               ← Utilitários
│   └── package.json
│
├── docker-compose.yml     ← Configuração Docker
├── README.md              ← Documentação
└── SETUP.md              ← Este arquivo
```

---

## 📚 Próximas Etapas

1. **Testado localmente?** ✅
   - Chat funciona?
   - Banco de dados está OK?
   - Admin panel carrega?

2. **Deploy em Staging**
   - Usar Coolify
   - Configurar domínio
   - Testar webhook PIX

3. **Deploy em Produção**
   - Backups automáticos
   - Monitoramento
   - SSL/TLS

---

## 📞 Suporte

Se tiver problemas:

1. Verificar logs:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. Reiniciar tudo:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. Verificar variáveis de ambiente:
   ```bash
   docker-compose exec backend env | grep GEMINI
   ```

---

**Pronto para começar?** 🎉

Qualquer dúvida, consulte o README.md para mais informações!
