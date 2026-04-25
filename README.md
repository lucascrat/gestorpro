# Gestor - Chat + Pagamento PIX + Automação

Sistema completo de suporte ao cliente com chat IA (Gemini Flash), pagamento via PIX (EFI) e automação de renovação em painel terceirizado.

## 🎯 Funcionalidades

- **Chat com IA Gemini Flash**: Atendimento inteligente de clientes
- **Pagamento via PIX (EFI)**: Integração completa com QR Code dinâmico
- **Automação de Renovação**: Bot que acessa o painel e renova clientes automaticamente
- **Painel Admin**: Gerenciamento de clientes e histórico de pagamentos
- **Webhook PIX**: Confirmação automática de pagamentos

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose (recomendado)
- PostgreSQL 16+ (ou use Docker)
- Chaves API:
  - Google Gemini Flash
  - EFI Pix
  - JWT Secret

### Instalação Local (sem Docker)

1. **Clonar repositório e instalar dependências**
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. **Configurar variáveis de ambiente**
```bash
# Backend
cp backend/.env.example backend/.env
# Preencher com suas chaves

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Setup do banco de dados**
```bash
cd backend
npm run migrate
```

4. **Executar em desenvolvimento**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Com Docker Compose

```bash
# Criar arquivo .env na raiz
cp .env.example .env
# Preencher variáveis

# Iniciar tudo
docker-compose up -d

# Executar migrations
docker-compose exec backend npm run migrate
```

## 📝 Estrutura do Projeto

```
gestor/
├── backend/          # Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Lógica de rotas
│   │   ├── services/        # Gemini, EFI, Playwright
│   │   ├── models/          # Tipos/Interfaces
│   │   ├── middleware/      # Autenticação JWT
│   │   ├── database/        # Migrations
│   │   └── config/          # Configurações
│   └── package.json
│
├── frontend/         # Next.js 14
│   ├── app/
│   │   ├── chat/            # Interface do chat
│   │   ├── admin/           # Dashboard admin
│   │   └── api/             # API routes (se necessário)
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🔌 API Endpoints

### Chat
- `POST /api/chat/session` - Criar nova sessão
- `POST /api/chat/message` - Enviar mensagem
- `GET /api/chat/history/:sessionId` - Histórico

### Pagamentos
- `POST /api/webhooks/pix` - Webhook EFI (confirmação)
- `GET /api/payments/:transactionId` - Status do pagamento

### Clientes (Admin)
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Editar cliente
- `DELETE /api/clients/:id` - Deletar cliente
- `GET /api/clients/:id/payments` - Pagamentos do cliente

## 🔑 Configuração das Variáveis de Ambiente

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gestor_db

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui

# Gemini AI
GEMINI_API_KEY=sua_chave_gemini_aqui

# EFI Pix
EFI_CLIENT_ID=seu_client_id
EFI_CLIENT_SECRET=seu_client_secret
EFI_WEBHOOK_URL=https://seu-dominio.com/api/webhooks/pix

# Painel STARTPAINEL
PANEL_URL=https://cms.startpainel.cc
PANEL_ADMIN_USERNAME=seu_usuario_admin
PANEL_ADMIN_PASSWORD=sua_senha_admin

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📊 Fluxo de Funcionamento

```
1. Cliente entra em /chat
   ↓
2. Cria sessão + WebSocket conectado
   ↓
3. Digita mensagem → IA Gemini responde
   ↓
4. Se pedir para pagar:
   - Backend gera QR Code PIX (EFI)
   - Exibe no chat
   ↓
5. Cliente escaneia e paga
   ↓
6. EFI envia webhook confirmando
   ↓
7. Backend ativa Playwright:
   - Abre navegador
   - Faz login no painel
   - Pesquisa cliente
   - Clica "Extender"
   - Confirma renovação
   ↓
8. Chat mostra: "✅ Renovado!"
```

## 🗄️ Schema do Banco de Dados

### users
```sql
id (serial) | email (varchar) | password_hash (varchar) | created_at (timestamp)
```

### clients
```sql
id (serial) | name | panel_username | panel_password_encrypted | 
renewal_cost (decimal) | status | created_at | updated_at
```

### payments
```sql
id (serial) | client_id | amount | status | pix_qr_code | 
pix_transaction_id | created_at | confirmed_at
```

### chat_messages
```sql
id (serial) | session_id | role | content | created_at
```

### renewal_logs
```sql
id (serial) | client_id | status | error_message | retry_count | created_at
```

## 🛡️ Segurança

- ✅ Senhas encriptadas com bcrypt
- ✅ JWT para autenticação admin
- ✅ Validação de webhooks EFI
- ✅ Rate limiting no chat
- ✅ CORS configurado
- ✅ Variáveis sensíveis no .env

## 🚢 Deploy na Coolify

1. **Conectar repositório Git**
```bash
git remote add coolify git@seu-servidor.com:seu-repo.git
```

2. **Criar arquivo .env no servidor**
```bash
# Via Coolify UI ou SSH
GEMINI_API_KEY=xxx
EFI_CLIENT_ID=xxx
# ... outras variáveis
```

3. **Fazer push**
```bash
git push coolify main
```

4. **Verificar logs**
```bash
coolify logs -f
```

## 🧪 Testes

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## 📚 Tecnologias

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Socket.io
- **Backend**: Node.js, Express, PostgreSQL, Playwright
- **IA**: Google Gemini Flash
- **Pagamentos**: API EFI Pix
- **Autenticação**: JWT
- **Containerização**: Docker

## 🐛 Troubleshooting

### Erro de conexão ao banco
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Recriar banco
docker-compose down -v
docker-compose up -d
```

### Webhook PIX não recebe
```bash
# Verificar URL do webhook nas variáveis de ambiente
# Certificar que EFI_WEBHOOK_URL é público e acessível
# Usar ngrok para testes locais:
ngrok http 3001
```

### Automação Playwright falha
```bash
# Verificar credenciais do painel
# Validar seletor CSS dos botões
# Ver logs do Playwright no backend
```

## 📝 Roadmap

- [ ] Suporte a múltiplos períodos de renovação
- [ ] Notificações por email
- [ ] Dashboard com analytics
- [ ] Histórico de chat persistente
- [ ] 2FA para admin
- [ ] Suporte a múltiplos idiomas
- [ ] Backup automático do banco

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `docker-compose logs -f`
2. Abrir issue no repositório
3. Contatar administrador

## 📄 Licença

Todos os direitos reservados © 2026
