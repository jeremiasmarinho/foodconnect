# FoodConnect - Master Strategic Brief (v1)

> Documento síntese executivo e operacional para guiar os primeiros 90 dias do projeto após análises de Gemini e Claude. Este arquivo deve ser mantido enxuto e atualizado quinzenalmente.

## 1. Essência do Projeto

**Declaração de Posicionamento**: O FoodConnect transforma a relação com gastronomia de um ato transacional ("fazer pedido rápido") para uma experiência de descoberta social curada, local e inteligente.

**Promessa ao Usuário**: "Descubra onde comer de forma inspirada, autêntica e personalizada – antes de pedir ou reservar."

**Promessa ao Restaurante**: "Construa presença, marca e demanda qualificada além de descontos e disputa por preço."

## 2. Hipóteses Centrais (a validar)

| Código | Hipótese                                                                                  | Tipo                  | Critério de Validação                                                      |
| ------ | ----------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| H1     | Usuários querem explorar experiências gastronômicas mesmo sem intenção de compra imediata | Mercado/Comportamento | ≥35% das sessões não geram ação transacional mas têm ≥5 interações sociais |
| H2     | Restaurantes veem valor em publicar conteúdo orgânico regularmente                        | Oferta                | ≥50% dos restaurantes piloto publicam 1+ post/semana após 30 dias          |
| H3     | Conteúdo curado inicial aumenta retorno nas 2 primeiras semanas                           | Produto               | Retenção W2 de usuários expostos a feed curado > 15pp acima de controle    |
| H4     | WhatsApp Bot converte leads qualificados para o beta                                      | Aquisição             | ≥30% dos leads originados no bot ativam conta no app em ≤7 dias            |
| H5     | Recomendação semântica simples gera cliques relevantes                                    | IA                    | CTR em blocos recomendados ≥20%                                            |

## 3. Foco dos Primeiros 90 Dias

| Mês | Objetivo Primário                 | Alavanca Principal                | Pergunta a Responder                                  |
| --- | --------------------------------- | --------------------------------- | ----------------------------------------------------- |
| 1   | Aquisição Qualificada + Semeadura | WhatsApp Bot + Seed Tool          | Pessoas querem consumir conteúdo gastronômico curado? |
| 2   | Engajamento Social Inicial        | Feed (posts + likes)              | Usuários voltam e publicam de novo?                   |
| 3   | Retenção + Relevância             | Busca Semântica + Reco Heurística | Conteúdo + recomendação criam ciclo de retorno?       |

## 4. Roadmap Enxuto (Macro)

1. **Mês 1**: Infra básica (auth, users, restaurants, feed minimal), Bot Beta, ferramenta interna de inserção de posts (seed), 300 posts iniciais, landing + lista de espera.
2. **Mês 2**: Feed público beta fechado, perfis básicos, métrica de recorrência, tracking de eventos, painel interno de métricas simples.
3. **Mês 3**: Busca semântica (pgvector), recomendação heurística (popularidade ponderada + proximidade + tags), ajustes UX, preparação para expansão limitada.

## 5. Arquitetura Operacional (Fase 1)

- Backend: Monólito NestJS (módulos: `auth`, `users`, `restaurants`, `feed`, `leads`, `search`).
- Patterns: Domain Layer + Application Services + Event Dispatcher in-memory (DomainEvents).
- DB: PostgreSQL com schemas lógicos (`core`, `social`, `leads`). Extensão: `pgvector` quando search entrar.
- IA MVP: embeddings + normalização de texto + sentimento básico (lib leve ou chamada externa). Sem fine-tuning.
- Infra: Deploy inicial em Render; métricas via logs estruturados + export simples (JSON) manual.

## 6. Modelo de Dados (Inicial)

| Entidade           | Campos Chave                                                                    | Observações                             |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------- |
| User               | id, name, phone, location_pref, created_at                                      | Onboarding mínimo + opt-in interesses   |
| Restaurant         | id, name, category, location (lat/long), tags[], active                         | Status para controle piloto             |
| Post               | id, user_id OR restaurant_id, media_url, caption, tags[], created_at, sentiment | Pré-processar tags normalizadas         |
| Lead               | id, phone, source, created_at, converted_at                                     | Source=whatsapp / landing               |
| Interaction        | id, user_id, post_id, type(like/save), created_at                               | Base para métricas feed                 |
| Embedding (futuro) | ref_type(post                                                                   | restaurant), ref_id, vector, created_at | Somente quando search ativar |

## 7. Eventos de Domínio (Inicial)

| Evento              | Payload Base               | Handler(s)                                       |
| ------------------- | -------------------------- | ------------------------------------------------ |
| PostCreated         | post_id, tags, author_type | Index para busca futura / atualizar métricas     |
| LeadCaptured        | lead_id, source            | Funil aquisição / nurture eventual               |
| PostInteracted      | user_id, post_id, type     | Métricas de engajamento / ranking incremental    |
| RestaurantActivated | restaurant_id              | Trigger seed posts recomendados / acompanhamento |

## 8. KPIs por Fase

| Fase        | KPI Primário            | Secundários                                   |
| ----------- | ----------------------- | --------------------------------------------- |
| Aquisição   | % Leads→Usuários        | Leads/dia, Origem, Conversão Bot              |
| Engajamento | Post Recurrence Rate    | Avg Posts/User, Like/Post, % Feed Vazio       |
| Retenção    | WAU/MAU                 | Session Depth, Tempo até 1ª Interação         |
| Relevância  | CTR Blocos Recomendados | Scroll Depth, % Explorações não transacionais |

## 9. Critérios de Go/No-Go (Fim de 90 dias)

Prosseguir para construção de pedidos/reservas apenas se:

- Retenção Semana 4 ≥ 40%
- ≥25% usuários ativos semanais postam ou interagem ≥3x/sem
- ≥15% restaurantes piloto com 1+ post semanal recorrente
- CTR Recomendação ≥20%
  Caso contrário: PIVOT para experiência mais editorial/curada manualmente.

## 10. Riscos & Mitigações

| Risco                    | Impacto                | Mitigação                             | Sinal Precoce              |
| ------------------------ | ---------------------- | ------------------------------------- | -------------------------- |
| Feed vazio               | Desengajamento inicial | Semeadura + creators pagos            | <5 posts/dia               |
| Baixa retenção           | Falha em PMF social    | Onboarding + notificações segmentadas | Retenção W2 < 25%          |
| Custo IA escalando       | Margens comprometidas  | Cache + reuso de embeddings           | Tokens/dia ↑ sem MAU ↑     |
| Adoção restaurante lenta | Oferta vazia futura    | Programa Fundadores Locais            | % restaurantes ativos <10% |
| Escopo crescendo         | Atrasos críticos       | Governance de backlog                 | Stories paralelos ↑        |

## 11. Governance & Cadência

| Ritual              | Frequência | Objetivo                      |
| ------------------- | ---------- | ----------------------------- |
| Review Métricas     | Semanal    | Ajustar foco tático           |
| Retro Técnica       | Quinzenal  | Reduzir dívida emergente      |
| Revisão Estratégica | Mensal     | Reavaliar hipóteses / roadmap |
| Atualização Brief   | Quinzenal  | Manter alinhamento documental |

## 12. Backlog Inicial (Sprint 0 → 2 semanas)

| Prioridade | Item                              | Definição de Pronto                                |
| ---------- | --------------------------------- | -------------------------------------------------- |
| Alta       | Scaffold NestJS + Módulos Base    | Build roda + endpoints health/auth                 |
| Alta       | Modelo de Dados + Migrações       | Tabelas criadas                                    |
| Alta       | Seed Tool Interna (CLI ou script) | 300 posts artificiais inseridos                    |
| Alta       | WhatsApp Lead Capture (mock)      | Leads salvos em tabela                             |
| Média      | Endpoint Feed (lista básica)      | Paginação + metadados básicos                      |
| Média      | Métricas mínimas (log estrut.)    | JSON logs com eventos chave                        |
| Média      | Landing mínima (static)           | Coleta email/telefone + integra lead               |
| Baixa      | Recomendação heurística v0        | Lista ordenada simples por created_at + like ratio |

## 13. Guard Rails Técnicos

- Sem introdução de novos serviços externos sem justificativa (>2x ganho claro).
- Cada novo endpoint precisa logar: request_id, user_id (se houver), latency.
- Tolerância a débito técnico documentado: item com owner + prazo para revisão.
- Proibir otimização prematura de consultas sem medição real (usar `EXPLAIN` quando necessário).

## 14. Filosofia de Produto

Começar opinativo, focado e curado. Abrir gradualmente. Evitar "feature parity" com incumbentes. Ganhar em identidade e relevância, não em amplitude.

## 15. Próximos Passos Imediatos Após Este Documento

1. Validar e congelar escopo Sprint 0.
2. Criar repositório + scaffold NestJS.
3. Implementar migrações iniciais.
4. Criar script de seed.
5. Configurar captura de leads (mock bot + endpoint REST placeholder).

---

Documento vivo – Revisão v1 concluída. Atualizar após primeiras métricas.
