# 🆓 Desenvolvimento Sem Custos - FoodConnect

## 🎯 Objetivo

Desenvolver o FoodConnect seguindo os princípios do AWS Well-Architected Framework, mas **sem custos durante a fase de desenvolvimento**, usando recursos locais e serviços gratuitos.

---

## 📊 Estratégia: Desenvolvimento Local → Produção AWS

### Fase 1: Desenvolvimento (0 custos) ← **ESTAMOS AQUI**

**Duração**: 3-6 meses  
**Custo**: $0/mês  
**Objetivo**: Validar produto, construir features, ganhar tração

### Fase 2: MVP Público (custos mínimos)

**Duração**: 3-6 meses  
**Custo**: ~$50-100/mês  
**Objetivo**: 100-1000 usuários iniciais

### Fase 3: Escala (otimizado)

**Duração**: 6+ meses  
**Custo**: $298-500/mês (conforme cresce)  
**Objetivo**: 10,000+ usuários, receita

---

## 🏗️ Arquitetura de Desenvolvimento (Custo Zero)

### Stack Atual (Local Development)

```
┌─────────────────────────────────────────────────────┐
│              DESENVOLVIMENTO LOCAL                   │
│                  (Custo: $0)                        │
└─────────────────────────────────────────────────────┘

Frontend (React Native - Expo)
├─ Expo Go (desenvolvimento)
├─ Metro Bundler (local)
└─ Tunnel/LAN para testes mobile

Backend (NestJS)
├─ Node.js local (porta 3000)
├─ SQLite (database local)
└─ File system (uploads)

Cache
└─ Node-cache (in-memory, sem Redis)

Imagens
└─ File system local (/uploads)

Monitoramento
└─ Console logs + VS Code debugger
```

---

## 💰 Comparação de Custos: Dev vs Produção

| Componente     | Desenvolvimento      | Produção AWS    | Economia |
| -------------- | -------------------- | --------------- | -------- |
| **Compute**    | Local (grátis)       | ECS Fargate $66 | $66/mês  |
| **Database**   | SQLite (grátis)      | RDS $140        | $140/mês |
| **Cache**      | node-cache (grátis)  | Redis $25       | $25/mês  |
| **Storage**    | File system (grátis) | S3 $8           | $8/mês   |
| **CDN**        | Local (grátis)       | CloudFront $10  | $10/mês  |
| **Monitoring** | Console (grátis)     | CloudWatch $17  | $17/mês  |
| **TOTAL**      | **$0/mês** ✅        | **$298/mês**    | **$298** |

---

## 🚀 Setup de Desenvolvimento (Zero Custo)

### 1. Ambiente Local Atual

```bash
# Backend
cd backend
npm install
npm run start:dev  # Porta 3000

# Frontend
cd frontend
npm install
npm start  # Expo Metro Bundler

# Database
# SQLite já configurado em prisma/dev.db
```

### 2. Alternativas Gratuitas para Serviços AWS

#### Database (RDS → SQLite/PostgreSQL local)

```typescript
// prisma/schema.prisma - Atual (SQLite)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// Para produção futura (PostgreSQL)
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }
```

**Vantagens SQLite em Dev**:

- ✅ Zero setup
- ✅ Arquivo único (fácil backup)
- ✅ Rápido para desenvolvimento
- ✅ Compatível com Prisma

**Migração para Produção**: Mudar provider para PostgreSQL

---

#### Cache (ElastiCache → node-cache)

```typescript
// backend/src/cache/local-cache.service.ts
import NodeCache from "node-cache";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalCacheService {
  private cache = new NodeCache({
    stdTTL: 300, // 5 minutes default
    checkperiod: 60, // Check for expired keys every 60s
  });

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get<T>(key);
    return value || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
  }

  async flush(): Promise<void> {
    this.cache.flushAll();
  }
}
```

**Migração para Produção**: Trocar por Redis (ioredis)

---

#### Storage (S3 → File System)

```typescript
// backend/src/upload/local-storage.service.ts
import { Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class LocalStorageService {
  private uploadDir = path.join(process.cwd(), "uploads");

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.writeFile(filepath, file.buffer);

    return `/uploads/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, filename);
    await fs.unlink(filepath);
  }

  async getFile(filename: string): Promise<Buffer> {
    const filepath = path.join(this.uploadDir, filename);
    return fs.readFile(filepath);
  }
}
```

**Migração para Produção**: Trocar por AWS S3 SDK

---

#### Secrets (Secrets Manager → .env local)

```bash
# .env.development (local - não commitar!)
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
PORT=3000

# .env.production (futuro AWS Secrets Manager)
# DATABASE_URL=obtido do Secrets Manager
# JWT_SECRET=obtido do Secrets Manager
```

---

## 🆓 Serviços Gratuitos para MVP

### 1. Hospedagem Frontend

#### Opção A: Vercel (RECOMENDADO)

```bash
# Deploy grátis para frontend web
npm install -g vercel
cd frontend
vercel

# Features gratuitas:
# - HTTPS automático
# - CDN global
# - Deploy automático do Git
# - 100 GB bandwidth/mês
```

#### Opção B: Netlify

```bash
# Similar ao Vercel
npm install -g netlify-cli
netlify deploy
```

#### Opção C: GitHub Pages

```bash
# Para sites estáticos
npm run build
gh-pages -d build
```

---

### 2. Hospedagem Backend

#### Opção A: Railway (RECOMENDADO)

```yaml
# railway.json
{
  "build": { "builder": "NIXPACKS" },
  "deploy":
    {
      "startCommand": "npm run start:prod",
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10,
    },
}
# Free tier:
# - $5 crédito/mês
# - 512 MB RAM
# - PostgreSQL grátis (1 GB)
```

#### Opção B: Render

```yaml
# render.yaml
services:
  - type: web
    name: foodconnect-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
```

#### Opção C: Fly.io

```toml
# fly.toml
app = "foodconnect"

[build]
  builder = "heroku/buildpacks:20"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

---

### 3. Database (Gratuito)

#### Opção A: Supabase (RECOMENDADO)

```bash
# PostgreSQL gratuito + autenticação + storage
# Free tier:
# - 500 MB database
# - 1 GB file storage
# - 2 GB bandwidth
# - Unlimited API requests

# Setup
npm install @supabase/supabase-js

# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

#### Opção B: PlanetScale

```bash
# MySQL serverless gratuito
# Free tier:
# - 5 GB storage
# - 1 billion row reads/month
# - 10 million row writes/month
```

#### Opção C: Neon

```bash
# PostgreSQL serverless
# Free tier:
# - 3 GB storage
# - Auto-scaling
# - Branching (como Git)
```

---

### 4. Image Storage (Gratuito)

#### Opção A: Cloudinary

```typescript
// backend/src/upload/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async uploadImage(file: Express.Multer.File): Promise<string> {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'foodconnect',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return result.secure_url;
}

// Free tier:
// - 25 GB storage
// - 25 GB bandwidth/mês
// - Image transformations
```

#### Opção B: ImgBB

```bash
# API gratuita para hospedar imagens
# Unlimited images
# Sem expiração
```

---

### 5. Monitoring (Gratuito)

#### Opção A: Sentry

```typescript
// backend/src/main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Free tier:
// - 5,000 errors/mês
// - 10,000 transactions/mês
// - 30 days retention
```

#### Opção B: LogRocket

```typescript
// Frontend error tracking
import LogRocket from "logrocket";

LogRocket.init("your-app-id");

// Free tier:
// - 1,000 sessions/mês
// - Session replay
// - Error tracking
```

---

## 📋 Roadmap de Desenvolvimento (Zero Custo)

### Fase 1: MVP Local (Atual) - $0/mês

**Já Implementado**:

- ✅ Backend NestJS com Auth
- ✅ Frontend React Native
- ✅ Database SQLite
- ✅ Upload de imagens local
- ✅ Cache in-memory

**Próximos Passos**:

- [ ] Implementar todas as features do MVP
- [ ] Testes locais completos
- [ ] Otimizar performance local
- [ ] Documentação de APIs

---

### Fase 2: Deploy Gratuito (~$0-5/mês)

**Quando**: Após MVP pronto localmente

**Stack Gratuito**:

```
Frontend → Vercel (grátis)
Backend → Railway ($5 crédito/mês)
Database → Supabase (grátis)
Images → Cloudinary (grátis)
Monitoring → Sentry (grátis)
```

**Custo**: ~$0/mês (usando créditos gratuitos)

---

### Fase 3: Primeiros Usuários (até $50/mês)

**Quando**: 100-500 usuários

**Stack**:

```
Frontend → Vercel Pro ($20/mês) se necessário
Backend → Railway Hobby ($10/mês)
Database → Supabase Pro ($25/mês) ou continuar free
Images → Cloudinary (ainda grátis)
Monitoring → Sentry (ainda grátis)
```

**Custo**: ~$35-55/mês

---

### Fase 4: Escala (AWS) ($298+/mês)

**Quando**: 1,000+ usuários + receita

Migrar para arquitetura AWS completa conforme documentado nos pilares do Well-Architected Framework.

---

## 🔧 Configuração Atual (Zero Custo)

### Backend

```typescript
// backend/src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),
    // SQLite local
    PrismaModule,
    // Cache in-memory
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes
    }),
    // Módulos da aplicação
    AuthModule,
    UsersModule,
    PostsModule,
    RestaurantsModule,
  ],
})
export class AppModule {}
```

### Frontend

```typescript
// frontend/src/api/client.ts
import axios from "axios";

const API_URL = __DEV__
  ? "http://localhost:3000" // Desenvolvimento local
  : "https://api.foodconnect.com"; // Produção futura

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
```

---

## 🎯 Quando Migrar para AWS?

### Indicadores para Migração:

1. **Usuários**: > 1,000 ativos
2. **Tráfego**: > 100k requests/mês
3. **Receita**: > $500/mês
4. **Storage**: > 10 GB de dados
5. **Equipe**: > 3 desenvolvedores
6. **Compliance**: Necessidade de certificações

### Pré-requisitos:

- [ ] MVP validado com usuários reais
- [ ] Product-market fit encontrado
- [ ] Receita recorrente estabelecida
- [ ] Investimento ou faturamento para cobrir AWS
- [ ] Equipe preparada para DevOps

---

## 📊 Estimativa de Custos por Fase

| Fase            | Usuários | Requests/mês | Storage  | Custo/mês    |
| --------------- | -------- | ------------ | -------- | ------------ |
| **Dev Local**   | Dev team | N/A          | < 1 GB   | **$0** ✅    |
| **MVP Deploy**  | 0-100    | < 10k        | < 1 GB   | **$0-5** ✅  |
| **Early Users** | 100-1k   | 10k-100k     | 1-10 GB  | **$35-55**   |
| **Growth**      | 1k-10k   | 100k-1M      | 10-50 GB | **$100-200** |
| **Scale (AWS)** | 10k+     | 1M+          | 50+ GB   | **$298+**    |

---

## ✅ Checklist de Desenvolvimento Sem Custos

### Setup Atual

- [x] Backend NestJS rodando local
- [x] Frontend React Native com Expo
- [x] SQLite database
- [x] File system storage
- [x] In-memory cache
- [x] Git version control

### Próximas Otimizações

- [ ] Configurar ambiente de staging (free tier)
- [ ] Setup CI/CD com GitHub Actions (grátis)
- [ ] Implementar testes automatizados
- [ ] Criar scripts de backup do SQLite
- [ ] Documentar APIs com Swagger
- [ ] Setup Sentry para error tracking (grátis)

### Quando Houver Usuários

- [ ] Deploy no Vercel (frontend)
- [ ] Deploy no Railway (backend)
- [ ] Migrar para Supabase (database)
- [ ] Setup Cloudinary (images)
- [ ] Implementar analytics (Google Analytics - grátis)

---

## 🎓 Melhores Práticas para Dev Local

### 1. Simular Produção Localmente

```bash
# Docker Compose para simular produção
docker-compose up -d

# Testa com PostgreSQL ao invés de SQLite
# Simula Redis
# Simula S3 com MinIO
```

### 2. Environment Variables

```bash
# .env.development
NODE_ENV=development
DATABASE_URL="file:./dev.db"
UPLOAD_DIR="./uploads"
CACHE_TYPE="memory"

# .env.staging (free tier)
NODE_ENV=staging
DATABASE_URL="postgresql://supabase..."
UPLOAD_PROVIDER="cloudinary"
CACHE_TYPE="memory"

# .env.production (futuro AWS)
NODE_ENV=production
DATABASE_URL="obtido de Secrets Manager"
UPLOAD_PROVIDER="s3"
CACHE_TYPE="redis"
```

### 3. Feature Flags

```typescript
// Ativar/desativar features caras
const FEATURES = {
  s3Upload: process.env.NODE_ENV === "production",
  redis: process.env.NODE_ENV === "production",
  cloudwatch: process.env.NODE_ENV === "production",
  emailService: process.env.SENDGRID_KEY ? true : false,
};
```

---

## 💡 Conclusão

**Estratégia Recomendada**:

1. **Agora (Dev)**: Continuar desenvolvimento local ($0/mês)
2. **MVP Pronto**: Deploy em serviços gratuitos ($0-5/mês)
3. **100-1k usuários**: Upgrade para tiers pagos baratos ($35-55/mês)
4. **1k+ usuários**: Migrar para AWS seguindo Well-Architected ($298+/mês)

**Benefícios**:

- ✅ Zero custo durante desenvolvimento
- ✅ Validar produto antes de gastar
- ✅ Aprender arquitetura AWS sem compromisso
- ✅ Migração gradual conforme cresce
- ✅ Documentação já pronta para produção

---

**Status**: ✅ **Desenvolvendo sem custos**  
**Próximo Milestone**: MVP completo localmente  
**Custo Atual**: **$0/mês** 🎉
