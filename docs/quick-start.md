# 🚀 Quick Start Guide - FoodConnect

> Guia rápido para iniciar o desenvolvimento do FoodConnect imediatamente após a fase de planejamento.

## ⚡ Setup em 30 Minutos

### 1. Pré-requisitos (5 min)
```bash
# Verificar versões
node --version    # ≥18.0.0
npm --version     # ≥9.0.0
git --version     # qualquer versão recente

# Instalar PostgreSQL se não tiver
# Windows: https://www.postgresql.org/download/windows/
# Ou usar Docker: docker run --name postgres -e POSTGRES_PASSWORD=admin -p 5432:5432 -d postgres
```

### 2. Criação do Projeto (10 min)
```bash
# Instalar NestJS CLI globalmente
npm i -g @nestjs/cli

# Criar projeto
nest new foodconnect-api
cd foodconnect-api

# Instalar dependências principais
npm i @nestjs/typeorm typeorm pg @nestjs/config
npm i @nestjs/jwt @nestjs/passport passport-jwt bcrypt
npm i joi winston class-validator class-transformer

# Dependências de desenvolvimento
npm i -D @types/pg @types/passport-jwt @types/bcrypt
npm i -D @nestjs/testing supertest
```

### 3. Configuração Inicial (10 min)
```bash
# Criar arquivo .env
cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:admin@localhost:5432/foodconnect
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=foodconnect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin

# JWT
JWT_SECRET=foodconnect-dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
EOF

# Criar database
createdb foodconnect
# Ou via SQL: CREATE DATABASE foodconnect;
```

### 4. Estrutura Inicial (5 min)
```bash
# Criar estrutura de módulos
mkdir -p src/{auth,users,restaurants,feed,search,leads,analytics,shared}

# Cada módulo terá:
# - module.ts
# - controller.ts  
# - service.ts
# - entity.ts (ou dto.ts)
```

## 📂 Estrutura Final de Arquivos

Após o setup, sua estrutura ficará assim:

```
foodconnect/
├── 📁 docs/                          # Documentação estratégica
│   ├── README.md                     # 🏠 Documento principal
│   ├── master-strategic-brief.md     # 📋 Estratégia consolidada
│   ├── development-roadmap.md        # 🛣️ Roadmap técnico detalhado
│   ├── ai-review-comparison.md       # 🤖 Comparativo das análises
│   ├── quick-start.md               # ⚡ Este guia
│   └── reviews/                      # Análises das IAs
│       ├── gemini-review-request.md
│       ├── gemini-analysis-response.md
│       ├── claude-analysis-response.md
│       ├── chatgpt-analysis-request.md
│       └── foodconnect-original.md   # Spec técnica original
│
├── 📁 backend/                       # API NestJS (a criar)
│   ├── src/
│   │   ├── auth/                     # Autenticação JWT
│   │   ├── users/                    # Gerenciamento de usuários
│   │   ├── restaurants/              # Perfis de restaurantes
│   │   ├── feed/                     # Posts e interações sociais
│   │   ├── search/                   # Busca semântica + recomendações
│   │   ├── leads/                    # Captura via WhatsApp
│   │   ├── analytics/                # Métricas e eventos
│   │   └── shared/                   # Utilities compartilhados
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── 📁 frontend/                      # React Native App (futuro)
├── 📁 dashboard/                     # Dashboard Web (futuro)
└── 📁 tools/                        # Scripts e ferramentas
    ├── seed-data.js                  # Script de semeadura
    └── analytics-dashboard.html      # Dashboard básico
```

## 🎯 Primeiros Comandos

### Criar Módulo Auth (Exemplo)
```bash
cd backend
nest g module auth
nest g controller auth
nest g service auth
nest g guard auth/jwt-auth
```

### Criar Primeira Migration
```bash
# Se usar TypeORM
npm i @nestjs/typeorm typeorm
# Configurar no app.module.ts

# Se usar Prisma (alternativa)
npm i prisma @prisma/client
npx prisma init
```

### Testar Configuração
```bash
npm run start:dev
# Deve iniciar na porta 3000
# GET localhost:3000 deve retornar "Hello World!"
```

## 📋 Checklist do Sprint 0 (2 semanas)

### Semana 1: Fundação
- [ ] ✅ Ambiente configurado (Node, Postgres, IDE)
- [ ] ✅ Projeto NestJS criado e rodando
- [ ] ✅ Banco de dados conectado
- [ ] ✅ Estrutura de módulos criada
- [ ] ✅ Autenticação JWT básica
- [ ] ✅ Primeiro endpoint protegido funcionando
- [ ] ✅ Logs estruturados configurados (Winston)

### Semana 2: Validação
- [ ] ✅ Testes básicos passando
- [ ] ✅ Deploy no Render funcionando
- [ ] ✅ Documentação Swagger gerada
- [ ] ✅ Variáveis de ambiente organizadas
- [ ] ✅ Scripts de desenvolvimento configurados
- [ ] ✅ Error handling global implementado
- [ ] ✅ Validação de DTOs funcionando

## 🎪 Demo do Sprint 0

No final das 2 semanas, você deve conseguir:

```bash
# 1. Registrar usuário
curl -X POST localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

# 2. Fazer login
curl -X POST localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 3. Acessar endpoint protegido
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  localhost:3000/users/profile

# 4. Verificar saúde da aplicação
curl localhost:3000/health
```

## 🚨 Troubleshooting Comum

### Erro de Conexão com Postgres
```bash
# Verificar se Postgres está rodando
pg_isready -h localhost -p 5432

# Testar conexão manual
psql -h localhost -U postgres -d foodconnect
```

### Erro de Permissões JWT
```bash
# Verificar se JWT_SECRET está definido
echo $JWT_SECRET

# Verificar token gerado
# Use jwt.io para decodificar e validar
```

### Performance Lenta
```bash
# Verificar logs de query lenta
# Configurar logging no TypeORM:
# logging: true, // em desenvolvimento
```

## 📞 Próximos Passos Após Sprint 0

1. **Sprint 1**: Implementar captura de leads (WhatsApp mock)
2. **Sprint 2**: Criar script de seed com 300 posts
3. **Sprint 3**: Desenvolver API completa do Feed
4. **Sprint 4**: Adicionar busca semântica básica

## 📚 Recursos de Referência

- **NestJS Docs**: https://docs.nestjs.com/
- **TypeORM Docs**: https://typeorm.io/
- **PostgreSQL pgvector**: https://github.com/pgvector/pgvector
- **JWT Best Practices**: https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/

---

**🎯 Meta Sprint 0**: Ter uma base sólida, testada e deployada para acelerar o desenvolvimento dos próximos 90 dias.

**⏰ Duração**: 2 semanas  
**🏁 Critério de Sucesso**: Demo funcionando + deploy estável