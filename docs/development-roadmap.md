# FoodConnect - Roadmap de Desenvolvimento

> Guia prático e técnico para os primeiros 90 dias de desenvolvimento, baseado nas análises estratégicas consolidadas.

## 🎯 Objetivos dos Primeiros 90 Dias

**Meta Central**: Validar a hipótese de "Descoberta Social Gastronômica" através de métricas mensuráveis.

**Pergunta-Chave**: Usuários brasileiros têm interesse real em uma experiência social curada para descoberta gastronômica?

## 📅 Sprint Plan Detalhado

### 🚀 **Sprint 0: Setup & Fundação (Semanas 1-2)**

#### Objetivos
- Ambiente de desenvolvimento configurado
- Estrutura de projeto criada e funcionando
- Primeiros endpoints básicos operacionais

#### Entregáveis
- [ ] Repositório Git configurado
- [ ] NestJS scaffold com módulos base
- [ ] PostgreSQL + migrações iniciais
- [ ] Autenticação JWT básica
- [ ] Logs estruturados configurados
- [ ] Deploy inicial no Render

#### Critérios de Aceite
- ✅ `npm start` roda sem erros
- ✅ Endpoints `/health` e `/auth/login` funcionando
- ✅ Migrations executam corretamente
- ✅ Logs aparecem estruturados no console

---

### 📱 **Sprint 1-2: Captura de Leads (Semanas 3-4)**

#### Objetivos
- WhatsApp Bot mockado capturando leads
- Landing page coletando interesse
- Primeiros leads qualificados no sistema

#### Entregáveis
- [ ] Endpoint REST para captura de leads
- [ ] Landing page estática (HTML + CSS básico)
- [ ] WhatsApp Bot simulado (webhook básico)
- [ ] Painel interno para visualizar leads
- [ ] Integração com formulário de interesse

#### Métricas Alvo
- 50+ leads capturados
- 70%+ leads com telefone válido
- Identificação das principais fontes de tráfego

---

### 🌱 **Sprint 3-4: Semeadura de Conteúdo (Semanas 5-6)**

#### Objetivos
- Sistema interno para criar posts iniciais
- 300+ posts de alta qualidade no sistema
- Categorização e tagging funcionando

#### Entregáveis
- [ ] Modelo de dados: User, Restaurant, Post, Tag
- [ ] Script de seed automatizado
- [ ] Interface interna (CLI ou web simples) para curadoria
- [ ] Sistema de tags normalizado
- [ ] 300 posts realísticos inseridos

#### Especificações Técnicas
```typescript
// Modelo Post
interface Post {
  id: string;
  authorId: string; // User ou Restaurant
  authorType: 'user' | 'restaurant';
  content: string;
  mediaUrl?: string;
  tags: string[];
  location?: { lat: number; lng: number };
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
}
```

---

### 📺 **Sprint 5-6: Feed Beta Fechado (Semanas 7-8)**

#### Objetivos
- Feed básico funcionando (posts + likes)
- Primeiros usuários beta engajando
- Métricas de interação sendo coletadas

#### Entregáveis
- [ ] API completa do Feed (GET, POST, PUT, DELETE)
- [ ] Sistema de likes/unlikes
- [ ] Paginação infinita
- [ ] Interface web básica para testes
- [ ] Onboarding de 20 usuários beta
- [ ] Dashboard de métricas internas

#### Métricas Alvo (Semana 8)
- 20+ usuários beta ativos
- 15+ posts orgânicos (não seed)
- 50+ interações (likes/comments)
- Identificar 3+ usuários "power users"

---

### 🧠 **Sprint 7-8: Busca e Recomendação (Semanas 9-10)**

#### Objetivos
- Busca semântica básica funcionando
- Recomendações heurísticas simples
- Primeiras evidências de relevância

#### Entregáveis
- [ ] pgvector configurado no PostgreSQL
- [ ] Geração de embeddings para posts (OpenAI)
- [ ] Endpoint de busca semântica
- [ ] Algoritmo de recomendação simples (popularidade + proximidade)
- [ ] A/B test básico (com vs sem recomendação)

#### Especificações Técnicas
```typescript
// Algoritmo de Recomendação V1
const recommendationScore = (post: Post, user: User) => {
  const baseScore = post.likesCount * 0.4;
  const recencyScore = daysSincePost(post) * -0.1;
  const proximityScore = user.location ? 
    calculateProximity(user.location, post.location) * 0.3 : 0;
  const tagMatchScore = calculateTagMatch(user.interests, post.tags) * 0.3;
  
  return baseScore + recencyScore + proximityScore + tagMatchScore;
};
```

---

### 📊 **Sprint 9-10: Métricas e Otimização (Semanas 11-12)**

#### Objetivos
- Sistema de métricas robusto implementado
- Primeiras otimizações baseadas em dados
- Preparação para validação das hipóteses

#### Entregáveis
- [ ] Event tracking completo (PostViewed, PostLiked, SearchExecuted)
- [ ] Dashboard analytics interno
- [ ] Relatórios automatizados semanais
- [ ] Otimizações de performance identificadas
- [ ] A/B tests mais sofisticados

#### Métricas de Sucesso (Fim de 90 dias)
- [ ] **H1**: ≥35% sessões exploratorias (≥5 interações sem transação)
- [ ] **H2**: ≥50% restaurantes piloto com 1+ post/semana
- [ ] **H3**: Retenção W2 > 15pp vs controle
- [ ] **H4**: ≥30% leads WhatsApp → usuários ativos
- [ ] **H5**: CTR recomendações ≥20%

---

## 🏗️ Arquitetura Técnica

### Estrutura de Módulos NestJS
```
src/
├── auth/          # JWT, guards, strategies
├── users/         # User management
├── restaurants/   # Restaurant profiles
├── feed/          # Posts, interactions
├── search/        # Semantic search + recommendations
├── leads/         # WhatsApp + lead capture
├── analytics/     # Event tracking + metrics
└── shared/        # Common utilities, DTOs
```

### Schema PostgreSQL (Inicial)
```sql
-- Core tables
CREATE SCHEMA core;
CREATE TABLE core.users (...);
CREATE TABLE core.restaurants (...);

-- Social features
CREATE SCHEMA social;
CREATE TABLE social.posts (...);
CREATE TABLE social.interactions (...);
CREATE TABLE social.post_embeddings (...);

-- Lead generation
CREATE SCHEMA leads;
CREATE TABLE leads.captured_leads (...);
CREATE TABLE leads.conversion_events (...);
```

### Eventos de Domínio
```typescript
// Domain Events (in-memory para MVP)
enum DomainEvent {
  USER_REGISTERED = 'user.registered',
  POST_CREATED = 'post.created',
  POST_LIKED = 'post.liked',
  SEARCH_EXECUTED = 'search.executed',
  LEAD_CAPTURED = 'lead.captured'
}
```

## 🎚️ Configuração de Ambiente

### Pré-requisitos
```bash
# Instalar Node.js 18+
node --version  # v18+

# Instalar PostgreSQL 15+
postgres --version  # 15+

# Instalar Redis (opcional, para cache)
redis-server --version
```

### Setup Inicial
```bash
# 1. Criar projeto NestJS
npm i -g @nestjs/cli
nest new foodconnect-api
cd foodconnect-api

# 2. Instalar dependências principais
npm i @nestjs/typeorm typeorm pg
npm i @nestjs/jwt @nestjs/passport passport-jwt
npm i @nestjs/config joi
npm i winston

# 3. Dev dependencies
npm i -D @types/pg @types/passport-jwt
npm i -D prisma  # Se escolher Prisma em vez de TypeORM
```

### Variáveis de Ambiente (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/foodconnect
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=foodconnect
POSTGRES_USER=user
POSTGRES_PASSWORD=pass

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d

# OpenAI (para embeddings)
OPENAI_API_KEY=sk-...

# WhatsApp (futuro)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
WHATSAPP_NUMBER=+5511999999999
```

## 📏 Métricas e Monitoramento

### Eventos Principais a Trackear
```typescript
interface AnalyticsEvent {
  userId?: string;
  sessionId: string;
  eventType: string;
  timestamp: Date;
  properties: Record<string, any>;
}

// Exemplos de eventos
const events = [
  'session_started',
  'post_viewed',
  'post_liked',
  'post_created',
  'search_executed',
  'recommendation_clicked',
  'profile_visited'
];
```

### KPIs Dashboard Interno
- **Daily Active Users (DAU)**
- **Posts Created / Day**
- **Likes / Post (avg)**
- **Search Queries / Day**
- **Recommendation CTR**
- **Session Duration (avg)**
- **Bounce Rate**

## 🚨 Critérios de Qualidade

### Definition of Done (DoD)
Para cada feature ser considerada "pronta":
- [ ] Testes unitários implementados (coverage >80%)
- [ ] Documentação da API atualizada (Swagger)
- [ ] Logs estruturados adicionados
- [ ] Performance testada (latência <500ms)
- [ ] Error handling implementado
- [ ] Reviewed por pelo menos 1 pessoa (self-review OK para solo)

### Guardrails Técnicos
- **Sem otimização prematura**: medir antes de otimizar
- **Sem novas dependências** sem justificativa (ROI >2x)
- **Event-driven design**: usar domain events para desacoplamento
- **Database per domain**: schemas separados desde o início

## 🔄 Cadência de Revisão

### Weekly (Toda Segunda)
- Review das métricas da semana anterior
- Ajustes no backlog com base nos dados
- Identificação de blockers técnicos

### Bi-weekly (Quintas alternadas)
- Demo das funcionalidades implementadas
- Refinamento do backlog das próximas 2 semanas
- Retrospectiva técnica (débitos, melhorias)

### Monthly (Primeira Sexta do Mês)
- Review das hipóteses estratégicas
- Análise de ROI das features implementadas
- Decisões go/no-go para próximo mês

## 🎯 Próximos Passos Imediatos

### Esta Semana
1. [ ] Configurar ambiente de desenvolvimento local
2. [ ] Criar repositório Git com estrutura inicial
3. [ ] Implementar scaffold NestJS básico
4. [ ] Configurar PostgreSQL + primeira migration

### Próxima Semana
1. [ ] Implementar autenticação JWT
2. [ ] Criar endpoints básicos de usuários
3. [ ] Setup de logs estruturados
4. [ ] Deploy inicial no Render

---

**🎯 Meta**: Ao final de 90 dias, ter dados concretos para decidir se a tese "Descoberta Social Gastronômica" é viável no mercado brasileiro.

**🚀 Lema**: "Aprender rápido, iterar mais rápido, falhar barato."