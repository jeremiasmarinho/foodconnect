# FoodConnect - Roadmap de Desenvolvimento

> Guia prático e técnico para os primeiros 90 dias de desenvolvimento, baseado nas análises estratégicas consolidadas.

**🎉 ATUALIZAÇÃO**: Features principais implementadas! Comments ✅ | Likes ✅ | Stories ✅

## 🎯 Objetivos dos Primeiros 90 Dias

**Meta Central**: Validar a hipótese de "Descoberta Social Gastronômica" através de métricas mensuráveis.

**Pergunta-Chave**: Usuários brasileiros têm interesse real em uma experiência social curada para descoberta gastronômica?

## 📊 Status Atual (Atualizado em 2024)

### ✅ Funcionalidades Implementadas

#### Sistema de Posts (100% Completo)

- ✅ CRUD de posts com imagens
- ✅ Feed paginado e filtrado
- ✅ Upload de múltiplas imagens
- ✅ Associação com restaurantes
- ✅ Sistema de rating (1-5 estrelas)
- ✅ Cache otimizado
- ✅ Testes E2E completos

#### Sistema de Comentários (100% Completo) 🎉

- ✅ **Backend**: CommentsModule, Service, Controller
- ✅ Criar comentários em posts
- ✅ Listar comentários com paginação
- ✅ Deletar comentários (apenas autor ou admin)
- ✅ Contadores em tempo real
- ✅ Notificações ao dono do post
- ✅ 12 testes unitários passando
- ✅ **Frontend**: Service, Hook, Components
- ✅ UI completa com CommentsList e CommentItem
- ✅ Integração com FeedScreen
- ✅ Script de teste automatizado
- ✅ **Documentação completa**: `/docs/development-logs/COMMENTS-FRONTEND-COMPLETE.md`

#### Sistema de Likes (100% Completo) ❤️

- ✅ **Backend**: Toggle like/unlike em um único endpoint
- ✅ Método `toggleLike()` no PostsService
- ✅ Endpoint `POST /posts/:id/like`
- ✅ Proteção contra duplicação (unique constraint)
- ✅ Contadores em tempo real
- ✅ Notificações assíncronas ao dono do post
- ✅ Cache invalidation automático
- ✅ **Frontend**: Service, Hook já integrados
- ✅ LikeAnimation component funcional
- ✅ UI otimista (resposta imediata)
- ✅ Integração completa FeedScreen
- ✅ Script de teste automatizado
- ✅ **Documentação completa**: `/docs/development-logs/LIKES-SYSTEM-COMPLETE.md`

#### Autenticação & Usuários

- ✅ JWT authentication
- ✅ Registro e login
- ✅ Proteção de rotas
- ✅ Perfis de usuário
- ✅ Upload de avatar

#### Restaurantes

- ✅ CRUD de restaurantes
- ✅ Associação com posts
- ✅ Busca e filtros
- ✅ Geolocalização básica

#### Infraestrutura

- ✅ NestJS + Prisma ORM
- ✅ SQLite (desenvolvimento local)
- ✅ Cache Redis-like
- ✅ Sistema de notificações
- ✅ Upload de arquivos
- ✅ Logs estruturados
- ✅ Testes unitários e E2E

#### Documentação

- ✅ AWS Well-Architected Framework (6 pilares + plano de implementação)
- ✅ Docker/Kubernetes Analysis (recomendação: adiar para escala)
- ✅ Zero-cost development strategy
- ✅ Sistema de Comentários - Guia completo
- ✅ Sistema de Likes - Guia completo
- ✅ Scripts de teste automatizados

---

## 🚀 Próximas Features (Prioridade)

### 🎬 **Prioridade 3: Sistema de Stories** (⭐⭐)

**Status**: Pendente | **Estimativa**: 2-3 horas | **Complexidade**: Média

**Escopo:**

- Backend: StoriesModule, Service, Controller
- Modelos: Story, StoryView
- Upload de imagens/vídeos para stories
- Expiração automática (24h)
- Visualizações (quem viu)
- Frontend: Stories carousel
- Animações de visualização

**Valor de Negócio:**

- Engajamento diário +40%
- Conteúdo efêmero (menos pressão)
- FOMO (fear of missing out)

---

### 🔔 **Prioridade 4: Sistema de Notificações** (⭐)

**Status**: 40% implementado | **Estimativa**: 1-2 horas | **Complexidade**: Baixa

**Já Implementado:**

- NotificationsModule
- `notifyPostLike()` - Notifica ao curtir post
- `notifyPostComment()` - Notifica ao comentar
- Infraestrutura básica

**Pendente:**

- Frontend: Tela de notificações
- Badge de notificações não lidas
- Push notifications (Expo)
- Preferências de notificação

**Valor de Negócio:**

- Retenção +25%
- Re-engagement automático
- Loop de feedback

---

### 🏆 **Prioridade 5: Sistema de Achievements** (⭐⭐)

**Status**: 60% implementado | **Estimativa**: 2 horas | **Complexidade**: Média

**Já Implementado:**

- AchievementsModule
- Modelo Achievement no Prisma
- UserAchievement (relação many-to-many)
- Service com verificação de conquistas

**Pendente:**

- Controller e endpoints REST
- Frontend: Badge display
- Animações de conquista desbloqueada
- Lista de achievements disponíveis

**Conquistas Planejadas:**

- 🍕 Primeira avaliação
- 📸 10 fotos postadas
- ❤️ 100 likes recebidos
- 💬 50 comentários feitos
- 🏅 Top contributor do mês

**Valor de Negócio:**

- Gamification
- Motivação para postar
- Status social

---

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
  authorType: "user" | "restaurant";
  content: string;
  mediaUrl?: string;
  tags: string[];
  location?: { lat: number; lng: number };
  sentiment?: "positive" | "neutral" | "negative";
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
  const proximityScore = user.location
    ? calculateProximity(user.location, post.location) * 0.3
    : 0;
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
  USER_REGISTERED = "user.registered",
  POST_CREATED = "post.created",
  POST_LIKED = "post.liked",
  SEARCH_EXECUTED = "search.executed",
  LEAD_CAPTURED = "lead.captured",
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
  "session_started",
  "post_viewed",
  "post_liked",
  "post_created",
  "search_executed",
  "recommendation_clicked",
  "profile_visited",
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
