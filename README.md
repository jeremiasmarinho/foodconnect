# FoodConnect - Plataforma de Descoberta Social Gastronômica

> **Status**: Em Produção �  
> **Arquitetura**: AWS Well-Architected Framework  
> **Última Atualização**: Outubro 2025

## 🎯 Visão do Projeto

O **FoodConnect** transforma a experiência gastronômica de um ato puramente transacional para uma jornada de **descoberta social curada, local e inteligente**.

**Para Usuários**: "Descubra onde comer de forma inspirada, autêntica e personalizada – antes de pedir ou reservar."  
**Para Restaurantes**: "Construa presença, marca e demanda qualificada além de descontos e disputa por preço."

## �️ AWS Well-Architected Framework

Este projeto segue os **6 pilares** do AWS Well-Architected Framework:

### 📋 Documentação Completa

- **[Executive Summary](./docs/aws-well-architected/EXECUTIVE-SUMMARY.md)** - Visão executiva e ROI
- **[Plano de Implementação](./docs/aws-well-architected/IMPLEMENTATION-PLAN.md)** - Roadmap de 12 semanas
- **[Visão Geral](./docs/aws-well-architected/README.md)** - Arquitetura e decisões

### Os 6 Pilares

1. **[Operational Excellence](./docs/aws-well-architected/01-operational-excellence.md)** - CI/CD, IaC, Monitoring
2. **[Security](./docs/aws-well-architected/02-security.md)** - WAF, IAM, Encryption, Compliance
3. **[Reliability](./docs/aws-well-architected/03-reliability.md)** - Multi-AZ, Auto-scaling, DR
4. **[Performance Efficiency](./docs/aws-well-architected/04-performance-efficiency.md)** - Cache, CDN, Optimization
5. **[Cost Optimization](./docs/aws-well-architected/05-cost-optimization.md)** - Right-sizing, Reserved Instances
6. **[Sustainability](./docs/aws-well-architected/06-sustainability.md)** - ARM64, Green Energy, Efficiency

## 🏗️ Estrutura da Documentação

### � **Documentos Estratégicos**

- [`master-strategic-brief.md`](./docs/master-strategic-brief.md) - Síntese estratégica e análises consolidadas
- [`development-roadmap.md`](./docs/development-roadmap.md) - Roadmap detalhado de desenvolvimento
- [`aws-well-architected/`](./docs/aws-well-architected/) - Framework AWS e arquitetura

### 📝 **Guias de Desenvolvimento**

- [`COMO-RODAR.md`](./COMO-RODAR.md) - Como executar o projeto localmente
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) - Guia de contribuição
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Guia de deployment
- [`SCRIPTS-README.md`](./SCRIPTS-README.md) - Documentação dos scripts

## 🚀 Status Atual

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

## � Credenciais de Sistema

### Usuário Administrador

- **Email**: `admin@foodconnect.com`
- **Senha**: `FoodConnect2024!`
- **Acesso**: Login via API ou frontend com permissões totais

## 🚀 **Setup Rápido**

### **Opção 1: Script Automático (Recomendado)**

```bash
# Windows PowerShell
.\setup.ps1

# Linux/Mac
chmod +x setup.sh && ./setup.sh
```

### **Opção 2: Docker (Mais Simples)**

```bash
# Iniciar todos os serviços
docker-compose -f docker-compose.dev.yml up -d

# Popular banco com dados de teste
curl -X POST http://localhost:3000/seed/database
```

### **Opção 3: Manual**

1. Configure PostgreSQL
2. `cd backend && npm install && npx prisma migrate dev`
3. `cd frontend && npm install`
4. `npm run start:dev` (backend) + `npm run web` (frontend)

📚 **Guia Completo**: [SETUP-GUIDE.md](./SETUP-GUIDE.md)

## �📞 Próximos Passos Imediatos

1. **Sistema Completo** ✅ - Backend NestJS + Frontend React Native funcionais
2. **Script de Seed** ✅ - 300 posts + usuários + restaurantes fictícios
3. **Sistema de Métricas** 🚧 - Event tracking + analytics básicos
4. **WhatsApp Bot** - Captura de leads automatizada
5. **Busca Semântica** - pgvector + OpenAI embeddings

## 📊 Status Atual

- ✅ **Backend**: 26 endpoints, autenticação JWT, validação completa
- ✅ **Frontend**: React Native com navegação, componentes reutilizáveis
- ✅ **Testes**: 44 testes passando, cobertura de unidade e integração
- ✅ **CI/CD**: GitHub Actions com qualidade gates
- ✅ **Validação**: Sistema completo de validação client/server-side
- ✅ **Error Handling**: Tratamento robusto de erros com feedback visual

---

## 📚 Para Saber Mais

- **Desenvolvimento**: Consulte [`development-roadmap.md`](./development-roadmap.md)
- **Estratégia Completa**: Veja [`master-strategic-brief.md`](./master-strategic-brief.md)
- **Guias Técnicos**: [`DATA_VALIDATION_GUIDE.md`](./DATA_VALIDATION_GUIDE.md) e [`ERROR_HANDLING_GUIDE.md`](./ERROR_HANDLING_GUIDE.md)

---

**🎯 Objetivo**: Validar "Descoberta Social Gastronômica" como categoria viável no mercado brasileiro em 90 dias.

**📧 Contato**: Jeremias Marinho  
**🤖 Suporte Técnico**: GitHub Copilot + Análises das IAs  
**⏰ Última Revisão**: Outubro 2025
