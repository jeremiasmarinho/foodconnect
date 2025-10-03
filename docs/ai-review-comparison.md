# Comparativo de Análises das IAs (Gemini vs Claude vs (Futuro) ChatGPT)

## 1. Visão Geral

Este documento consolida as visões estratégicas fornecidas até agora pelas IAs envolvidas no processo de revisão do projeto FoodConnect.

| Aspecto           | Gemini                        | Claude                                          | ChatGPT (a preencher) |
| ----------------- | ----------------------------- | ----------------------------------------------- | --------------------- |
| Nota Geral        | 8.5                           | 8.2                                             |                       |
| Força Principal   | Diferenciação Social + IA     | Framing narrativo (experiência)                 |                       |
| Maior Risco       | Complexidade / Execução Solo  | Feed vazio / UGC insuficiente                   |                       |
| MVP Sugerido      | WhatsApp Bot → App Básico     | WhatsApp Bot + Feed Beta Fechado                |                       |
| IA Inicial        | Reduzir escopo                | Reduzir drasticamente (embeddings + sentimento) |                       |
| Monetização Early | Comissão + Premium            | Adiar comissão, foco adoção                     |                       |
| Go-to-Market      | Bairro + Micro-Network        | Bairro + Semeadura Paga                         |                       |
| Métrica Chave     | Conversão recomendação → ação | Postagem recorrente / retenção social           |                       |

## 2. Convergências (Alinhamento Forte)

1. MVP está grande demais – precisa ser cortado.
2. WhatsApp Bot é canal estratégico inicial de aquisição.
3. IA avançada deve ser adiada (focar em núcleo simples e validável).
4. Validação social (conteúdo + engajamento) é pré-condição antes de pedidos/reservas complexos.
5. Go-to-Market hiperlocal é essencial (bairro piloto).

## 3. Divergências Relevantes

| Tema                         | Diferença                            | Implicação                                  | Síntese Proposta                                                                   |
| ---------------------------- | ------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Sequência MVP                | Gemini: Bot → App                    | Claude: Bot + Feed Beta antes do app aberto | Validar feed em ambiente controlado antes de escalar usuários gerais               |
| Monetização                  | Gemini aceita comissão cedo          | Claude adia completamente                   | Adoção > monetização no primeiro ciclo; só ativar cobrança após PMF social parcial |
| Foco Métrica Inicial         | Gemini foca conversão IA→ação        | Claude foca produção/recorrência de posts   | Fase 1: Engajamento Feed; Fase 2: Conversão IA                                     |
| Profundidade Técnica Inicial | Gemini sugere schemas separados cedo | Claude prioriza event bus + domain layering | Combinar: domain layering + pg schemas para isolamento leve                        |

## 4. Síntese Estratégica Unificada (Proposta)

### Objetivo Norte: Validar a Tese "Descoberta Social Gastronômica" em 90 dias.

### Pergunta Central: Usuários retornam para explorar conteúdos gastronômicos curados e gerados por pares/restaurantes?

### Roadmap Unificado (90 dias)

| Mês | Foco                   | Entregáveis                                                    | Métrica North Star                |
| --- | ---------------------- | -------------------------------------------------------------- | --------------------------------- |
| 1   | Aquisição Qualificada  | WhatsApp Bot + Seed Tool + 300 posts semeados                  | 30% leads viram usuários beta     |
| 2   | Engajamento Social     | Feed (posts + likes) + Perfis básicos + Observabilidade        | 25% usuários postam ≥2x / 14 dias |
| 3   | Retenção e Refinamento | Busca semântica básica + Recomendação heurística + Melhoria UX | 40% retenção semana 4             |

### Critérios de Go para Fase Transacional (Pedidos/Reservas)

Prosseguir apenas se:

- ≥ 25% dos usuários ativos semanais interagem (postam, curtem ou salvam) 3+ vezes/semana
- ≥ 15% dos restaurantes piloto criam conteúdo semanalmente
- ≥ 30% das buscas orgânicas vêm via canal social/descoberta

## 5. KPIs Consolidados por Fase

| Fase               | KPI Primário                  | Secundários                         | Ferramentas                  |
| ------------------ | ----------------------------- | ----------------------------------- | ---------------------------- |
| Aquisição          | Leads Qualificados (WhatsApp) | CTR para Download / Origem          | Bot Logs + Simple DB         |
| Engajamento        | Post Recurrence Rate          | Likes/Post, % Feed Vazio            | Feed Service + Metrics Store |
| Retenção           | WAU/MAU                       | Session Depth, Time-to-First-Action | Analytics + Custom Counters  |
| Conversão (futuro) | Reco→Clique                   | Clique→Pedido                       | Reco Engine Logs             |

## 6. Arquitetura Recomendada (Versão Conciliada)

- Monólito Modular NestJS.
- Camadas: `domain` / `application` / `infrastructure` / `interfaces`.
- Event Dispatcher interno (in-memory) para `PostCreated`, `LikeAdded`, `LeadCaptured`.
- Postgres único com schemas lógicos (`core`, `social`, `leads`).
- pgvector para embeddings (adiar Pinecone).
- Cache Redis (apenas se métricas de latência > alvo; não no dia 1).

## 7. Riscos Não Mitigados (A Serem Monitorados)

| Risco                    | Sinal Precoce                 | Mitigação                                       |
| ------------------------ | ----------------------------- | ----------------------------------------------- |
| Feed Estagnado           | Posts/dia < limiar            | Semeadura contínua + creators locais            |
| Baixa Retenção           | Retenção W4 < 35%             | Onboarding iterativo + notificações segmentadas |
| Custo IA Escalando       | Custo/token > projeção        | Cache + batch embeddings                        |
| Adoção Restaurante Fraca | Engajamento < 10%             | Benefícios visuais + destaque feed curado       |
| Overbuild                | Backlog crescente não lançado | Trancar escopo por sprint (no more scope creep) |

## 8. Decisões Centrais (Alignment Log)

| Decisão                         | Status   | Justificativa                          |
| ------------------------------- | -------- | -------------------------------------- |
| Adiar pedidos/reservas          | Aprovado | Evitar sobrecarga antes de PMF social  |
| Usar pgvector no MVP            | Aprovado | Reduz dependências externas            |
| Bot como primeiro produto       | Aprovado | Canal de aquisição e validação         |
| Monetização só após PMF parcial | Aprovado | Minimiza atrito onboarding restaurante |

## 9. Próximos Passos Recomendados

1. Definir modelo de dados mínimo (User, Restaurant, Post, Lead, Tag).
2. Implementar seed script interno para geração inicial de posts.
3. Criar esqueleto NestJS com módulos: `auth`, `users`, `restaurants`, `feed`, `leads`.
4. Especificar eventos de domínio e handlers.
5. Implementar Bot (mock) + persistência leads.
6. Definir dashboard interno simples (admin web ou CLI) para monitorar KPIs iniciais.

## 10. Espaço para Análise do ChatGPT

(Reservado para futura inserção em `chatgpt-analysis-response.md` e atualização desta matriz.)

---

Documento vivo – atualizar conforme novas análises forem adicionadas.
