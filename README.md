# FoodConnect - Plataforma de Descoberta Social Gastronômica

> **Status**: Sprint 0 em Desenvolvimento 🚧  
> **Progresso**: Backend Base Implementado (Auth + Users + Restaurants)  
> **Última Atualização**: Outubro 2025

## 🎯 Visão do Projeto

O **FoodConnect** transforma a experiência gastronômica de um ato puramente transacional para uma jornada de **descoberta social curada, local e inteligente**.

**Para Usuários**: "Descubra onde comer de forma inspirada, autêntica e personalizada – antes de pedir ou reservar."  
**Para Restaurantes**: "Construa presença, marca e demanda qualificada além de descontos e disputa por preço."

## 🏗️ Estrutura da Documentação

### 📋 **Documentos Estratégicos**

- [`master-strategic-brief.md`](./master-strategic-brief.md) - **DOCUMENTO PRINCIPAL** - Síntese executiva, hipóteses, roadmap 90 dias
- [`ai-review-comparison.md`](./ai-review-comparison.md) - Comparativo das análises Gemini vs Claude vs ChatGPT
- [`foodconnect.md`](./foodconnect.md) - Especificação técnica completa original (1300+ linhas)

### 🤖 **Análises das IAs**

- [`gemini-review-request.md`](./gemini-review-request.md) - Solicitação de análise para Gemini
- [`gemini-analysis-response.md`](./gemini-analysis-response.md) - Análise do Gemini (8.5/10)
- [`claude-analysis-response.md`](./claude-analysis-response.md) - Análise do Claude (8.2/10)
- [`chatgpt-analysis-request.md`](./chatgpt-analysis-request.md) - Solicitação de análise para ChatGPT-4

### 📝 **Documentos de Desenvolvimento**

- [`development-roadmap.md`](./development-roadmap.md) - Roadmap detalhado de desenvolvimento (este arquivo)

## 🚀 Status Atual

### ✅ **Fase Completada: Planejamento Estratégico**

- [x] Documentação técnica abrangente
- [x] Análise crítica por múltiplas IAs
- [x] Síntese estratégica consolidada
- [x] Definição de hipóteses e KPIs
- [x] Roadmap 90 dias validado

### 🎯 **Próxima Fase: Sprint 0 (Preparação)**

- [ ] Setup do ambiente de desenvolvimento
- [ ] Scaffold do backend NestJS
- [ ] Modelo de dados e migrações
- [ ] Script de seed inicial
- [ ] Configuração de métricas básicas

## 📊 Resumo Executivo

| Aspecto                  | Detalhes                                      |
| ------------------------ | --------------------------------------------- |
| **Diferencial**          | Feed Social + IA Concierge + WhatsApp-first   |
| **Mercado Alvo**         | Brasil (WhatsApp dominante)                   |
| **Arquitetura**          | Monolito Modular → Microsserviços             |
| **Stack Principal**      | NestJS + PostgreSQL + React Native            |
| **Avaliação das IAs**    | 8.2-8.5/10 (Alto potencial, execução crítica) |
| **Investimento Inicial** | ~R$ 500/mês (infra + IA)                      |
| **Timeline MVP**         | 90 dias para validação social                 |

## 🎯 Hipóteses Centrais (A Validar em 90 Dias)

| ID     | Hipótese                                             | Critério de Sucesso                              |
| ------ | ---------------------------------------------------- | ------------------------------------------------ |
| **H1** | Usuários exploram gastronomia sem intenção de compra | ≥35% sessões não-transacionais com ≥5 interações |
| **H2** | Restaurantes publicam conteúdo regularmente          | ≥50% restaurantes piloto com 1+ post/semana      |
| **H3** | Conteúdo curado aumenta retenção inicial             | Retenção W2 > 15pp acima do controle             |
| **H4** | WhatsApp Bot converte leads qualificados             | ≥30% leads → usuários ativos em ≤7 dias          |
| **H5** | Recomendação semântica gera engagement               | CTR em blocos recomendados ≥20%                  |

## � Progresso Atual - Sprint 0

### ✅ **Backend Base Implementado**

| Módulo             | Status                | Endpoints   | Funcionalidades                     |
| ------------------ | --------------------- | ----------- | ----------------------------------- |
| **Authentication** | ✅ Completo           | 4 endpoints | JWT, registro, login, perfil        |
| **Users**          | ✅ Completo           | 6 endpoints | CRUD, busca, paginação              |
| **Restaurants**    | ✅ Completo           | 7 endpoints | CRUD, geolocalização, busca textual |
| **Posts**          | 🔄 Em desenvolvimento | -           | Feed social, likes, comentários     |

### 🏗️ **Arquitetura Implementada**

- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **Auth**: JWT com refresh tokens e guards
- **Validation**: class-validator para todos os DTOs
- **Logging**: Estruturado com contexto de operações

## �🛣️ Roadmap 90 Dias

| **Mês 1**                 | **Mês 2**               | **Mês 3**                 |
| ------------------------- | ----------------------- | ------------------------- |
| **Aquisição + Semeadura** | **Engajamento Social**  | **Retenção + Relevância** |
| WhatsApp Bot              | Feed (posts + likes)    | Busca Semântica           |
| Seed Tool (300 posts)     | Perfis básicos          | Recomendação Heurística   |
| Landing + Lista de Espera | Métricas de recorrência | Ajustes de UX             |

## 🔑 Insights das Análises das IAs

### 💪 **Consenso: Pontos Fortes**

- Diferenciação clara e viável
- Estratégia WhatsApp-first adequada ao Brasil
- Arquitetura evolutiva bem planejada
- Documentação de alta qualidade

### ⚠️ **Consenso: Principais Riscos**

- Complexidade alta para desenvolvedor solo
- Dependência de network effects para feed
- Velocidade de cópia por incumbentes
- Necessidade de validação agressiva da hipótese social

### 🎯 **Recomendação Unificada**

**MVP RADICAL**: Começar com WhatsApp Bot + Feed Beta fechado antes do app público completo.

## 🏁 Critérios de Go/No-Go (Fim de 90 dias)

Prosseguir para pedidos/reservas **APENAS SE**:

- ✅ Retenção Semana 4 ≥ 40%
- ✅ ≥25% usuários ativos postam/interagem ≥3x/semana
- ✅ ≥15% restaurantes piloto com posts recorrentes
- ✅ CTR Recomendação ≥20%

**Caso contrário**: PIVOT para modelo mais editorial/curado.

## 🛠️ Stack Tecnológico (Validado)

| Camada          | Tecnologia                                | Justificativa                       |
| --------------- | ----------------------------------------- | ----------------------------------- |
| **Backend**     | NestJS + TypeScript                       | Produtividade + arquitetura modular |
| **Database**    | PostgreSQL + pgvector                     | Relacional + busca semântica nativa |
| **Frontend**    | React Native                              | Mobile-first, cross-platform        |
| **IA**          | OpenAI embeddings + Análise de sentimento | Simples, eficaz para MVP            |
| **Deploy**      | Render → AWS                              | Custo inicial baixo, escala futura  |
| **Comunicação** | WhatsApp (Twilio)                         | Canal dominante no Brasil           |

## 📈 KPIs por Fase

| Fase            | KPI Primário         | Secundários                                   |
| --------------- | -------------------- | --------------------------------------------- |
| **Aquisição**   | % Leads → Usuários   | Leads/dia, Origem, Conversão Bot              |
| **Engajamento** | Post Recurrence Rate | Posts/User, Likes/Post, % Feed Vazio          |
| **Retenção**    | WAU/MAU              | Session Depth, Tempo até 1ª Interação         |
| **Relevância**  | CTR Recomendações    | Scroll Depth, % Explorações não-transacionais |

## 📞 Próximos Passos Imediatos

1. **Configurar Ambiente** - Node.js, PostgreSQL, VS Code extensions
2. **Criar Repositório** - Git + estrutura inicial
3. **Scaffold NestJS** - Módulos base + autenticação
4. **Modelo de Dados** - Migrações + seed script
5. **WhatsApp Mock** - Captura de leads básica
6. **Métricas Mínimas** - Logs estruturados + dashboard simples

---

## 📚 Para Saber Mais

- **Desenvolvimento**: Consulte [`development-roadmap.md`](./development-roadmap.md)
- **Estratégia Completa**: Veja [`master-strategic-brief.md`](./master-strategic-brief.md)
- **Análises Técnicas**: Confira [`ai-review-comparison.md`](./ai-review-comparison.md)

---

**🎯 Objetivo**: Validar "Descoberta Social Gastronômica" como categoria viável no mercado brasileiro em 90 dias.

**📧 Contato**: Jeremias Marinho  
**🤖 Suporte Técnico**: GitHub Copilot + Análises das IAs  
**⏰ Última Revisão**: Outubro 2025
