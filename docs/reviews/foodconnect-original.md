Arquitetura de Backend do Projeto FoodConnect

1. Visão Geral da Arquitetura
   Esta arquitetura é baseada no padrão de Microsserviços. Cada serviço é independente, focado em uma única responsabilidade de negócio, possui seu próprio banco de dados e se comunica com os outros através de APIs (síncronas) e um sistema de mensageria (assíncrono).

A plataforma atenderá a dois clientes principais: o App do Cliente (React Native) e o Dashboard do Estabelecimento (React.js). Ambos acessarão os serviços através de um API Gateway, que serve como uma porta de entrada única, simplificando a segurança, o roteamento e a orquestração das requisições.

Diagrama da Arquitetura de Alto Nível (Conceitual)
graph TD
subgraph Clientes
A1[App Cliente <br> (React Native)]
A2[Dashboard Estabelecimento <br> (React.js)]
end

    subgraph Infraestrutura de Backend
        B(API Gateway)

        subgraph Microsserviços
            C[Serviço de Usuários & Autenticação]
            D[Serviço Social (Feed)]
            E[Serviço de Restaurantes & Cardápios]
            F[Serviço de Reservas & Pedidos]
            G[Serviço de Busca (IA Concierge)]
            H[Serviço de Notificações]
            I[Serviço de Fidelidade & Promoções]
        end

        subgraph Banco de Dados
            DB1[(PostgreSQL - Usuários)]
            DB2[(MongoDB - Feed)]
            DB3[(PostgreSQL - Restaurantes)]
            DB4[(PostgreSQL - Reservas)]
            DB5[(Vector DB - IA)]
            DB6[(PostgreSQL - Fidelidade)]
        end

        subgraph Comunicação Assíncrona
            MQ{Message Queue <br> (RabbitMQ / Kafka)}
        end
    end

    A1 --> B; A2 --> B
    B --> C; B --> D; B --> E; B --> F; B --> G; B --> I
    C <--> DB1; D <--> DB2; E <--> DB3; F <--> DB4; G <--> DB5; I <--> DB6
    F -- Evento: Reserva Criada --> MQ
    MQ -- Consome Evento --> H; MQ -- Consome Evento --> I
    D -- Evento: Novo Comentário --> MQ
    H -- Envia Push Notification --> A1; H -- Envia Push Notification --> A2

2. Detalhamento dos Microsserviços
   Serviço de Fidelidade & Promoções: Gerencia o programa de pontos, recompensas, e o sistema de vouchers/cupons de desconto aplicáveis no momento da reserva.

(As responsabilidades dos outros serviços permanecem as mesmas.)

3. Componentes Transversais
   (As funções dos componentes transversais permanecem as mesmas.)

4. Arquitetura de Implementação na AWS
   Esta seção detalha como a arquitetura conceitual será implementada usando serviços específicos da AWS. Nota: Para uma abordagem de baixo custo inicial (MVP), consulte a Seção 7. Para uma abordagem otimizada para um desenvolvedor solo, consulte a Seção 9.

Diagrama da Arquitetura na AWS (Produção)
graph TD
subgraph Clientes
A1[App Cliente]
A2(Dashboard Web) --> CDN[CloudFront]
S3[(S3 <br> Hospedagem Estática)] --> CDN
end

    subgraph "AWS Cloud"
        WAF[AWS WAF] -- Protege --> B[API Gateway]

        B -- Autenticação --> Cognito[Amazon Cognito]
        B -- Roteamento --> Lambda[AWS Lambda]
        B -- Roteamento --> ECS[ECS + Fargate]

        subgraph "Computação"
            Lambda
            ECS
            Bedrock[Amazon Bedrock]
        end

        subgraph "Dados e Caching"
            RDS[RDS/Aurora PostgreSQL]
            DocDB[DocumentDB]
            OpenSearch[OpenSearch]
            Cache[ElastiCache <br> (Redis/Memcached)]
        end

        subgraph "Mensageria e Notificações"
            SNS[SNS]
            SQS[SQS]
            SES[SES]
        end
    end

    A1 --> B; CDN --> B
    Lambda --> RDS; Lambda --> DocDB; ECS --> RDS
    Lambda --> Cache; ECS --> Cache

    subgraph "Fluxo Assíncrono"
        Lambda -- Publica --> SNS
        ECS -- Publica --> SNS
        SNS -- Fan-out --> SQS_Notif[SQS Notificações]
        SNS -- Fan-out --> SQS_Fidel[SQS Fidelidade & Promoções]

        Consumer_Notif[Lambda] --> SQS_Notif
        Consumer_Fidel[Lambda] --> SQS_Fidel
    end

    Consumer_Notif -- Push --> SNS; Consumer_Notif -- E-mail --> SES
    Lambda -- IA --> Bedrock
    Bedrock --> OpenSearch

Detalhamento dos Serviços AWS
(Esta seção permanece a mesma, representando o alvo de produção)

5. Padrões de Desenvolvimento e Qualidade
   (Esta seção permanece a mesma)

6. Estratégias Avançadas de Escalabilidade e Resiliência na AWS
   (Esta seção permanece a mesma, representando o alvo de produção)

7. Estratégia de MVP e Otimização de Custos (Fase Inicial)
   (Esta seção descreve uma abordagem genérica de baixo custo. Para uma estratégia específica para o desenvolvedor solo, a Seção 9 é mais recomendada.)

8. Estratégias para uma Experiência de Usuário Inspirada no iFood
   (Esta seção permanece a mesma)

9. Roteiro Prático para o Desenvolvedor Solo
   Considerando que você irá desenvolver o projeto sozinho, a eficiência, a velocidade e a simplicidade de manutenção são as maiores prioridades. Uma arquitetura de microsserviços distribuídos (múltiplas Lambdas) irá atrasá-lo com a sobrecarga de configuração e gerenciamento.

A recomendação profissional para este cenário é a abordagem de Monolito Modular.

O que é um Monolito Modular?
É uma única aplicação backend (um único projeto Node.js) onde a separação lógica dos "serviços" (usuários, restaurantes, pedidos) é feita através de módulos de código. Tudo é desenvolvido, testado e implantado como um único processo, eliminando a complexidade da comunicação de rede entre serviços.

Vantagens para você:

Velocidade Extrema: Desenvolver e testar novas funcionalidades é muito mais rápido.

Debugging Simplificado: Rastrear um erro em um único código-base é trivial.

Sem Complexidade de Infra: Você gerencia uma única aplicação e um único banco de dados.

Custo-Benefício: Geralmente mais barato para começar.

Diagrama da Arquitetura para o Desenvolvedor Solo
graph TD
subgraph Clientes
A1[App Cliente <br> (React Native)]
A2[Dashboard Web <br> (React.js)]
end

    subgraph "Plataforma de Implantação (ex: Render ou AWS)"
        subgraph "Backend: App Node.js Único"
            B[API (Controllers)]
            C[Módulo de Usuários]
            D[Módulo de Restaurantes]
            E[Módulo de Pedidos]
            F[...]
        end

        DB[(Banco de Dados PostgreSQL)]
    end

    A1 --> B
    A2 --> B
    B <--> C; B <--> D; B <--> E; B <--> F
    C <--> DB; D <--> DB; E <--> DB; F <--> DB

Stack Tecnológico Recomendado para Máxima Produtividade
Backend: Node.js com o framework NestJS.

Por quê? NestJS é construído sobre TypeScript e força uma arquitetura organizada (módulos, controllers, services), o que é perfeito para um monolito modular. Ele irá acelerar seu desenvolvimento drasticamente.

ORM (Object-Relational Mapping): Prisma ou TypeORM.

Por quê? Facilitam enormemente a comunicação com o banco de dados de forma segura e com tipagem forte.

Banco de Dados: PostgreSQL. A escolha de um único banco de dados relacional é robusta e flexível o suficiente para todos os seus dados no início.

Implantação (Deployment):

Opção 1 (Mais Simples e Rápida): Render. É uma plataforma moderna que se conecta ao seu GitHub e faz o deploy do seu app NestJS e do banco de dados PostgreSQL com poucos cliques. Custo-benefício excelente para começar.

Opção 2 (AWS Simplificado): AWS Fargate rodando um único contêiner com sua aplicação NestJS, conectado a uma instância Amazon RDS (PostgreSQL). Um pouco mais de configuração, mas mantém você no ecossistema AWS.

Plano de Ação Adaptado para Você
Fase 0: Preparação (Mantém-se)

Configure os repositórios, a conta AWS (com alertas de faturamento!), e defina o contrato da API com OpenAPI/Swagger.

Fase 1: Construindo o Monolito (3-4 Semanas)

Crie um único projeto NestJS.

Dentro dele, crie os módulos: AuthModule (usando JWT), UsersModule, RestaurantsModule, MenusModule, OrdersModule.

Configure a conexão com o banco de dados PostgreSQL usando Prisma ou TypeORM.

Implemente a lógica de negócio principal dentro desses módulos.

Fase 2: Frontends Essenciais (Mantém-se)

Desenvolve os fluxos críticos do dashboard do estabelecimento e do app do cliente, consumindo sua API NestJS.

Fases 3, 4 e 5 (Mantém-se)

O foco permanece em adicionar funcionalidades, testar com parceiros reais e coletar feedback para buscar investimento.

Esta abordagem é a estratégia mais inteligente para um fundador técnico solo. Ela permite que você foque 100% em construir o produto. A migração para microsserviços é um "bom problema" para se ter no futuro, quando você tiver tração, investimento e uma equipe.

10. Bibliotecas Consolidadas por Microsserviço
    Esta seção detalha as bibliotecas mais consolidadas e recomendadas para cada microsserviço, priorizando soluções maduras, bem documentadas e amplamente adotadas pela comunidade.

10.1. Serviço de Usuários & Autenticação
**Bibliotecas Core:**

- `@nestjs/passport` + `passport-jwt` + `passport-local` - Autenticação robusta e flexível
- `argon2` - Hash de senhas (mais seguro que bcrypt)
- `@nestjs/jwt` - Gerenciamento de tokens JWT
- `class-validator` + `class-transformer` - Validação e transformação de dados
- `@nestjs/throttler` - Rate limiting para segurança
- `speakeasy` + `qrcode` - Autenticação de dois fatores (2FA)

**Exemplo de uso:**

```typescript
// Configuração do JWT no AuthModule
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: "1d" },
});
```

10.2. Serviço Social (Feed) - "Instagram Gastronômico"
**Visão Geral:**
O feed social é o coração da experiência social do FoodConnect, funcionando como um Instagram focado em gastronomia, onde usuários e restaurantes criam uma comunidade gastronômica vibrante.

**Tipos de Conteúdo:**

1. **Posts de Usuários:**

   - 📸 Fotos de pratos pedidos com avaliação/review
   - 👥 Momentos com amigos/família nos restaurantes
   - ⭐ Check-ins em restaurantes com rating
   - 🎉 Celebrações especiais (aniversários, encontros)
   - 📝 Reviews detalhadas com fotos antes/depois

2. **Posts de Restaurantes (Business Account):**
   - 🔥 Promoções e ofertas especiais
   - 🎵 Eventos (música ao vivo, shows, quiz nights)
   - 🍽️ Lançamento de novos pratos/cardápios
   - 👨‍🍳 Behind-the-scenes (preparo dos pratos, equipe)
   - 📅 Eventos sazonais e datas comemorativas

**Bibliotecas Core:**

- `multer` + `sharp` + `ffmpeg` - Upload/processamento de imagens e vídeos
- `@aws-sdk/client-s3` ou `cloudinary` - Storage otimizado para mídia
- `@nestjs/bull` + `bull` - Processamento assíncrono de feed
- `nestjs-typeorm-paginate` - Paginação infinita otimizada
- `socket.io` - Atualizações em tempo real (likes, comentários)
- `ioredis` - Cache para interactions e trending content
- `bad-words` + `@tensorflow/tfjs` - Moderação de conteúdo com IA
- `node-nlp` - Análise de sentimento em comentários
- `geolib` - Posts baseados em localização
- `@nestjs/schedule` - Agendamento de posts promocionais

**Funcionalidades Sociais:**

```typescript
// Estrutura do Post
interface FeedPost {
  id: string;
  type: "USER_POST" | "RESTAURANT_POST" | "EVENT_POST";
  authorId: string;
  authorType: "CLIENT" | "RESTAURANT";
  content: {
    caption: string;
    media: MediaFile[]; // fotos/vídeos
    location?: {
      restaurantId?: string;
      coordinates: [number, number];
      address: string;
    };
    tags: string[]; // #pizza #italiano #romântico
    mentions: string[]; // @amigos
  };
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  businessData?: {
    isPromotion: boolean;
    discountPercentage?: number;
    eventDate?: Date;
    menuItems?: string[]; // IDs dos pratos
    ctaButton?: "ORDER_NOW" | "BOOK_TABLE" | "LEARN_MORE";
  };
  createdAt: Date;
  updatedAt: Date;
}

// Sistema de Reações
enum ReactionType {
  LIKE = "👍",
  LOVE = "❤️",
  YUM = "😋",
  WOW = "😮",
  FIRE = "🔥",
}
```

**Algoritmo de Feed:**

```typescript
@Injectable()
export class FeedAlgorithmService {
  async generatePersonalizedFeed(userId: string, page: number) {
    const userPreferences = await this.getUserPreferences(userId);
    const location = await this.getUserLocation(userId);

    // Scoring factors
    const posts = await this.getFeedPosts({
      factors: {
        recency: 0.3, // Posts mais recentes
        proximity: 0.25, // Restaurantes próximos
        interactions: 0.2, // Posts com mais engajamento
        preferences: 0.15, // Tipos de culinária preferidos
        socialGraph: 0.1, // Amigos e restaurantes seguidos
      },
      location,
      userPreferences,
      page,
    });

    return posts;
  }

  // Posts trending por localização
  async getTrendingPosts(location: Location) {
    const trending = await this.redis.zrevrange(
      `trending:${location.city}`,
      0,
      19
    );
    return trending;
  }
}
```

**Integração com Sistema de Pedidos:**

```typescript
// CTA integrado nos posts de restaurantes
const restaurantPost = {
  caption: "🔥 Oferta especial! Pizza Margherita com 30% OFF hoje!",
  media: [{ url: 'pizza-image.jpg', type: 'image' }],
  businessData: {
    isPromotion: true,
    discountPercentage: 30,
    menuItems: ['pizza-margherita-id'],
    ctaButton: 'ORDER_NOW' // Botão que leva direto ao pedido
  }
};

// Quando usuário clica em "ORDER_NOW"
@Post('/feed/:postId/order')
async orderFromPost(@Param('postId') postId: string, @Body() orderData) {
  const post = await this.feedService.getPost(postId);

  // Aplicar desconto automático se for promoção
  if (post.businessData?.isPromotion) {
    orderData.discount = post.businessData.discountPercentage;
  }

  return this.orderService.createOrderFromFeedPost(orderData);
}
```

**Stories Temporários (24h):**

```typescript
interface Story {
  id: string;
  authorId: string;
  authorType: 'CLIENT' | 'RESTAURANT';
  media: MediaFile;
  caption?: string;
  viewers: string[]; // IDs de quem visualizou
  expiresAt: Date; // 24h após criação
}

// Auto-cleanup de stories expirados
@Cron('0 */6 * * *') // A cada 6 horas
async cleanupExpiredStories() {
  await this.storyRepository.delete({
    expiresAt: LessThan(new Date())
  });
}
```

**Moderação e Segurança:**

```typescript
// Moderação automática com IA
@Injectable()
export class ContentModerationService {
  async moderatePost(post: CreatePostDto) {
    // 1. Verificar texto ofensivo
    const hasOffensiveText = this.badWordsFilter.isProfane(post.caption);

    // 2. Análise de sentimento
    const sentiment = await this.nlp.getSentiment(post.caption);

    // 3. Verificar imagens (AWS Rekognition)
    const imageAnalysis = await this.rekognition.detectModerationLabels({
      Image: { S3Object: { Bucket: "feed-images", Key: post.mediaKey } },
    });

    // 4. Auto-aprovação ou flag para revisão manual
    if (
      hasOffensiveText ||
      sentiment.score < -0.8 ||
      imageAnalysis.ModerationLabels.length > 0
    ) {
      return { status: "PENDING_REVIEW", reason: "Automatic flagging" };
    }

    return { status: "APPROVED" };
  }
}
```

**Métricas e Analytics:**

```typescript
// Tracking de engajamento
const feedMetrics = {
  dailyActivePosters: number;
  averageTimeInFeed: number;
  postsPerUser: number;
  restaurantEngagementRate: number;
  conversionFeedToOrder: number; // % de posts que geram pedidos
  trendingHashtags: string[];
  topPerformingRestaurants: RestaurantStats[];
};
```

**Notificações Sociais:**

- 💕 "João curtiu sua foto do hambúrguer"
- 💬 "3 novos comentários no seu post"
- 👥 "Maria postou uma foto no Restaurante Italiano"
- 🔥 "Promoção especial no seu restaurante favorito"
- 🎵 "Show ao vivo hoje no Villa Bianca - Não perca!"

  10.3. Serviço de Restaurantes & Cardápios
  **Bibliotecas Core:**

- `geolib` + `@turf/turf` - Cálculos geoespaciais precisos
- `fuse.js` ou `@elastic/elasticsearch` - Busca fuzzy e facetada
- `date-fns` - Manipulação de datas e horários
- `slugify` - Geração de URLs amigáveis
- `dinero.js` - Manipulação segura de valores monetários
- `cache-manager` + `cache-manager-redis-store` - Cache distribuído
- `lodash` - Utilitários para agrupamento e filtros

**Exemplo de uso:**

```typescript
// Busca por proximidade
import { getDistance } from "geolib";

const nearbyRestaurants = restaurants.filter(
  (restaurant) => getDistance(userLocation, restaurant.location) <= maxDistance
);
```

10.4. Serviço de Reservas & Pedidos
**Bibliotecas Core:**

- `xstate` - State machine para workflow complexo de pedidos
- `stripe` + `mercadopago` + `pagseguro` - Múltiplos gateways de pagamento
- `@nestjs/bull` - Queue para processamento de pedidos
- `@nestjs/schedule` + `node-cron` - Agendamento de tarefas
- `puppeteer` - Geração de PDFs (recibos/notas)
- `socket.io` - Tracking em tempo real
- `crypto` - Verificação de webhooks

**Exemplo de uso:**

```typescript
// State machine para pedido
const orderMachine = createMachine({
  id: "order",
  initial: "pending",
  states: {
    pending: { on: { CONFIRM: "confirmed" } },
    confirmed: { on: { PREPARE: "preparing" } },
    preparing: { on: { READY: "ready" } },
  },
});
```

10.5. Inteligência Artificial no FoodConnect - "AI-Powered Food Discovery"
**Visão Geral:**
A IA é o diferencial competitivo do FoodConnect, transformando a experiência de descoberta gastronômica através de um assistente inteligente que entende preferências, contexto e humor do usuário para fazer recomendações precisas e personalizadas.

**Componentes de IA Implementados:**

### **1. IA Concierge - Assistente Pessoal Gastronômico**

```typescript
@Injectable()
export class AIConciergeService {
  async processNaturalLanguageQuery(query: string, userId: string) {
    // Exemplos de queries naturais:
    // "Quero algo romântico e não muito caro"
    // "Preciso de comida japonesa para 4 pessoas hoje às 20h"
    // "Estou triste, me sugere algo que me anime"
    // "Onde tem a melhor pizza perto do shopping?"

    const userContext = await this.getUserContext(userId);
    const intent = await this.extractIntent(query);
    const entities = await this.extractEntities(query);

    return this.generateRecommendations({
      query,
      userContext,
      intent,
      entities,
    });
  }

  private async extractIntent(query: string) {
    const prompt = `
    Analise a intenção do usuário na seguinte query gastronômica:
    "${query}"
    
    Classifique a intenção como:
    - SEARCH_RESTAURANT: Busca por restaurante específico
    - SEARCH_FOOD: Busca por tipo de comida
    - MOOD_BASED: Baseada em humor/sentimento
    - OCCASION_BASED: Para ocasião específica
    - BUDGET_BASED: Baseada em orçamento
    - TIME_SENSITIVE: Com urgência de tempo
    - SOCIAL: Para grupo/família
    
    Responda apenas com a classificação.
    `;

    return this.llmService.query(prompt);
  }
}
```

### **2. Sistema de Recomendação Híbrido**

```typescript
@Injectable()
export class RecommendationEngine {
  async generatePersonalizedRecommendations(
    userId: string,
    context: RecommendationContext
  ) {
    // Combina múltiplas técnicas de IA
    const recommendations = await Promise.all([
      this.collaborativeFiltering(userId), // "Usuários similares gostaram"
      this.contentBasedFiltering(userId), // Baseado no histórico
      this.contextualRecommendations(context), // Hora, clima, localização
      this.moodBasedRecommendations(userId), // Análise de sentimento
      this.socialRecommendations(userId), // Baseado em amigos
    ]);

    // Ensemble das recomendações com pesos dinâmicos
    return this.weightedEnsemble(recommendations, {
      collaborative: 0.25,
      contentBased: 0.25,
      contextual: 0.2,
      mood: 0.15,
      social: 0.15,
    });
  }

  private async moodBasedRecommendations(userId: string) {
    const recentPosts = await this.getUserRecentActivity(userId);
    const moodAnalysis = await this.analyzeMood(recentPosts);

    const moodToFoodMapping = {
      happy: ["italiana", "churrasco", "festiva"],
      sad: ["comfort_food", "doces", "caseira"],
      stressed: ["japonesa", "healthy", "light"],
      romantic: ["francesa", "italiana", "wine_bar"],
      energetic: ["mexicana", "street_food", "spicy"],
    };

    return this.findRestaurantsByMood(moodAnalysis.dominant_mood);
  }
}
```

### **3. Busca Semântica Avançada**

```typescript
@Injectable()
export class SemanticSearchService {
  async searchRestaurantsSemanticaly(query: string, location: Location) {
    // Converte query para embedding
    const queryEmbedding = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    // Busca similaridade no vector database
    const similarRestaurants = await this.pinecone.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 20,
      includeMetadata: true,
      filter: {
        location: { $near: location },
        isActive: true,
      },
    });

    // Re-rank baseado em contexto adicional
    return this.contextualReRanking(similarRestaurants, {
      query,
      location,
      timeOfDay: new Date().getHours(),
      weatherCondition: await this.getWeather(location),
    });
  }

  private async contextualReRanking(results: SearchResult[], context: Context) {
    // Ajusta score baseado em contexto
    const contextPrompt = `
    Dado o contexto:
    - Hora: ${context.timeOfDay}h
    - Clima: ${context.weatherCondition}
    - Localização: ${context.location.city}
    
    Re-ordene estes restaurantes para a query: "${context.query}"
    
    Considere fatores como:
    - Adequação ao horário
    - Tipo de comida apropriada para o clima
    - Distância e conveniência
    `;

    return this.llmService.rerank(results, contextPrompt);
  }
}
```

### **4. IA Preditiva para Restaurantes**

```typescript
@Injectable()
export class RestaurantAIService {
  async predictDemand(restaurantId: string, targetDate: Date) {
    const features = await this.extractFeatures(restaurantId, targetDate);

    // Modelo de Machine Learning para previsão
    const prediction = await this.demandModel.predict({
      dayOfWeek: targetDate.getDay(),
      hour: targetDate.getHours(),
      weather: features.weather,
      localEvents: features.events,
      historicalOrders: features.historical,
      promotions: features.activePromotions,
      socialMedia: features.socialMediaBuzz,
    });

    return {
      expectedOrders: prediction.orders,
      confidence: prediction.confidence,
      peakHours: prediction.peakHours,
      recommendations: this.generateBusinessRecommendations(prediction),
    };
  }

  async optimizePricing(restaurantId: string) {
    const marketData = await this.getMarketData(restaurantId);
    const competitorPricing = await this.scrapeCompetitorPrices(restaurantId);
    const demandForecast = await this.predictDemand(restaurantId, new Date());

    return this.dynamicPricingEngine.optimize({
      marketData,
      competitorPricing,
      demandForecast,
      restaurantMetrics: await this.getRestaurantMetrics(restaurantId),
    });
  }
}
```

### **5. Análise de Sentimento em Tempo Real**

```typescript
@Injectable()
export class SentimentAnalysisService {
  async analyzeFeedbackSentiment(text: string, language: string = "pt-BR") {
    const analysis = await this.nlpModel.analyze(text, {
      sentiment: true,
      emotions: true,
      aspects: true, // Comida, serviço, ambiente, preço
      language,
    });

    return {
      overall: analysis.sentiment, // -1 a 1
      emotions: analysis.emotions, // joy, anger, disgust, etc
      aspects: {
        food: analysis.aspects.food,
        service: analysis.aspects.service,
        ambiance: analysis.aspects.ambiance,
        price: analysis.aspects.price,
      },
      actionable_insights: this.generateActionableInsights(analysis),
    };
  }

  private generateActionableInsights(analysis: SentimentAnalysis) {
    const insights = [];

    if (analysis.aspects.food < 0.5) {
      insights.push({
        category: "FOOD_QUALITY",
        severity: "HIGH",
        suggestion: "Revisar qualidade dos ingredientes e preparo",
        priority: 1,
      });
    }

    if (analysis.aspects.service < 0.3) {
      insights.push({
        category: "SERVICE",
        severity: "CRITICAL",
        suggestion: "Treinamento urgente da equipe de atendimento",
        priority: 0,
      });
    }

    return insights;
  }
}
```

### **6. Chatbot Inteligente Multilíngue**

```typescript
@Injectable()
export class FoodChatbotService {
  async processUserMessage(
    message: string,
    userId: string,
    context: ChatContext
  ) {
    const conversation = await this.getConversationHistory(userId);

    const systemPrompt = `
    Você é o FoodBot, assistente gastronômico do FoodConnect.
    
    Personalidade:
    - Entusiasta de comida brasileira
    - Amigável e descontraído
    - Conhece bem a gastronomia local
    - Usa emojis moderadamente
    - Fala português brasileiro
    
    Contexto do usuário:
    - Localização: ${context.location}
    - Preferências: ${context.userPreferences}
    - Histórico recente: ${context.recentOrders}
    
    Capacidades:
    - Recomendar restaurantes
    - Explicar pratos
    - Sugerir combinações
    - Informar sobre promoções
    - Agendar reservas
    - Rastrear pedidos
    `;

    const response = await this.llmService.chat({
      messages: [
        { role: "system", content: systemPrompt },
        ...conversation,
        { role: "user", content: message },
      ],
      functions: this.getAvailableFunctions(),
    });

    // Executar função se necessário
    if (response.function_call) {
      const result = await this.executeFunction(response.function_call);
      return this.formatFunctionResponse(result);
    }

    return response.content;
  }

  private getAvailableFunctions() {
    return [
      {
        name: "search_restaurants",
        description: "Busca restaurantes baseado em critérios",
        parameters: {
          type: "object",
          properties: {
            cuisine: { type: "string" },
            location: { type: "string" },
            price_range: { type: "string" },
            mood: { type: "string" },
          },
        },
      },
      {
        name: "make_reservation",
        description: "Agenda reserva em restaurante",
        parameters: {
          type: "object",
          properties: {
            restaurant_id: { type: "string" },
            date: { type: "string" },
            time: { type: "string" },
            people: { type: "number" },
          },
        },
      },
    ];
  }
}
```

### **7. IA para Detecção de Fraude e Moderação**

```typescript
@Injectable()
export class FraudDetectionService {
  async analyzeOrder(order: Order) {
    const riskScore = await this.calculateRiskScore({
      userBehavior: await this.analyzeUserBehavior(order.userId),
      paymentPattern: await this.analyzePaymentPattern(order.payment),
      orderPattern: await this.analyzeOrderPattern(order),
      deviceFingerprint: order.deviceInfo,
      locationConsistency: await this.checkLocationConsistency(order),
    });

    if (riskScore > 0.8) {
      return {
        action: "BLOCK",
        reason: "High fraud probability",
        manual_review: true,
      };
    } else if (riskScore > 0.6) {
      return {
        action: "ADDITIONAL_VERIFICATION",
        reason: "Medium fraud risk",
        verification_type: "SMS_2FA",
      };
    }

    return { action: "APPROVE", risk_score: riskScore };
  }

  async moderateContent(content: UserContent) {
    const analysis = await Promise.all([
      this.textModerationAI.analyze(content.text),
      this.imageModerationAI.analyze(content.images),
      this.contextualAnalysis(content),
    ]);

    return {
      safe: analysis.every((a) => a.safe),
      categories: analysis.flatMap((a) => a.flagged_categories),
      confidence: Math.min(...analysis.map((a) => a.confidence)),
      action: this.determineModeractionAction(analysis),
    };
  }
}
```

**Bibliotecas Core Expandidas:**

- **LLM & Frameworks:**

  - `@langchain/core` + `langchain` - Orquestração de LLM
  - `@aws-sdk/client-bedrock-runtime` - AWS Bedrock (Claude, Llama)
  - `openai` - GPT-4, embeddings, whisper
  - `@anthropic-ai/sdk` - Claude para raciocínio complexo

- **Vector & Semantic Search:**

  - `@pinecone-database/pinecone` - Vector database escalável
  - `weaviate-ts-client` - Alternativa open-source
  - `faiss-node` - Busca vetorial local

- **NLP & ML:**

  - `@tensorflow/tfjs` - ML no browser/servidor
  - `natural` - Processamento de texto em português
  - `sentiment` - Análise de sentimento
  - `compromise` - Análise gramatical

- **Specialized AI:**
  - `@google-cloud/translate` - Tradução automática
  - `@azure/cognitiveservices-textanalytics` - Análise de texto
  - `ml-distance` - Cálculos de similaridade
  - `brain.js` - Redes neurais simples

**Casos de Uso Práticos da IA:**

1. **"Estou com vontade de algo especial hoje"**
   - IA analisa humor via posts recentes
   - Sugere restaurantes baseado no estado emocional
2. **"Primeira vez no Rio, onde devo comer?"**
   - IA considera perfil turístico
   - Recomenda experiências autênticas locais
3. **"Jantar romântico, orçamento R$ 200 para 2"**

   - IA filtra por ambiente, preço e avaliações
   - Considera iluminação, música, tipo de cozinha

4. **Restaurante prevê baixa demanda**
   - IA sugere promoções dinâmicas
   - Otimiza preços em tempo real
5. **Detecção de review fake**
   - IA analisa padrões de escrita
   - Identifica comportamentos suspeitos

**Estratégia de Implementação da IA - Roadmap Prático:**

**Fase 1 - MVP de IA (2-3 meses):**

```typescript
// Implementações básicas essenciais
const aiMVP = {
  basicRecommendations: "Algoritmo colaborativo simples",
  textSearch: "Busca fuzzy com Fuse.js",
  sentimentBasic: "Análise básica com biblioteca sentiment",
  contentModeration: "Bad-words + regras básicas",
};
```

**Fase 2 - IA Intermediária (4-6 meses):**

```typescript
const aiIntermediate = {
  semanticSearch: "OpenAI embeddings + Pinecone",
  chatbot: "GPT-3.5 com prompts estruturados",
  personalizedFeed: "ML básico para ordenação",
  moodAnalysis: "Análise de sentimento avançada",
};
```

**Fase 3 - IA Avançada (6-12 meses):**

```typescript
const aiAdvanced = {
  customLLM: "Fine-tuning para gastronomia brasileira",
  predictiveAnalytics: "Modelos de demanda e preços",
  multimodalAI: "Análise de imagens + texto",
  voiceInterface: "Pesquisa por voz em português",
};
```

**Considerações de Custos de IA:**

```typescript
// Estimativa mensal para diferentes escalas
const aiCosts = {
  mvp: {
    openai: "$50-100/month",
    pinecone: "$70/month",
    total: "$120-170/month",
  },
  growth: {
    openai: "$300-500/month",
    pinecone: "$200/month",
    aws_bedrock: "$150/month",
    total: "$650-850/month",
  },
  scale: {
    openai: "$1000+/month",
    custom_models: "$500/month",
    infrastructure: "$800/month",
    total: "$2300+/month",
  },
};
```

**Métricas de IA para Monitoramento:**

- **Precisão de recomendações**: >85% de clique-through
- **Tempo de resposta**: <2s para queries de IA
- **Satisfação do chatbot**: >4.5/5 em NPS
- **Conversão IA→Pedido**: >20% das recomendações
- **Redução de spam**: >95% de conteúdo moderado automaticamente

  10.6. Atendente Virtual via WhatsApp - "FoodBot Assistant"
  **Visão Geral:**
  Canal público de atendimento via WhatsApp que funciona como porta de entrada para o FoodConnect, oferecendo informações gastronômicas e convertendo usuários interessados em downloads do app. Disponível 24/7 para qualquer pessoa, cadastrada ou não.

**Funcionalidades do Atendente Virtual:**

### **1. Informações Gastronômicas Públicas**

```typescript
@Injectable()
export class WhatsAppBotService {
  async processPublicInquiry(message: string, phoneNumber: string) {
    const userExists = await this.checkUserExists(phoneNumber);
    const intent = await this.classifyIntent(message);

    switch (intent) {
      case "RESTAURANT_INFO":
        return this.provideRestaurantInfo(message, userExists);
      case "EVENT_INQUIRY":
        return this.provideEventInfo(message);
      case "MENU_QUESTION":
        return this.provideMenuInfo(message);
      case "GENERAL_HELP":
        return this.provideGeneralHelp(userExists);
      case "APP_DOWNLOAD":
        return this.handleAppDownload(phoneNumber);
      default:
        return this.handleUnknownQuery(message, userExists);
    }
  }

  private async provideRestaurantInfo(query: string, isRegistered: boolean) {
    const restaurants = await this.searchRestaurants(query);

    if (!restaurants.length) {
      return `🤔 Não encontrei restaurantes com esse critério.
      
Tente perguntar:
• "Pizzarias na Vila Madalena"
• "Restaurantes japoneses no centro"
• "Bares com música ao vivo hoje"

${
  isRegistered
    ? ""
    : "\n📱 *Baixe o FoodConnect* para fazer pedidos e reservas!\n👉 foodconnect.app/download"
}`;
    }

    const infoText = restaurants
      .slice(0, 3)
      .map(
        (r) => `
🍽️ *${r.name}*
📍 ${r.address}
⭐ ${r.rating}/5 (${r.reviewCount} avaliações)
💰 Faixa: ${r.priceRange}
⏰ ${r.isOpen ? "Aberto agora" : `Fecha às ${r.closingTime}`}
${r.hasLiveMusic ? "🎵 Música ao vivo hoje!" : ""}
${r.hasPromotion ? "🔥 Promoção especial!" : ""}
    `
      )
      .join("\n---\n");

    return `${infoText}

${
  isRegistered
    ? "📱 Abra o app para fazer pedidos e reservas!"
    : "📱 *Baixe o FoodConnect* para fazer pedidos e reservas!\n👉 foodconnect.app/download"
}`;
  }
}
```

### **2. Consulta de Eventos e Música ao Vivo**

```typescript
private async provideEventInfo(query: string) {
  const events = await this.searchEvents(query);

  if (!events.length) {
    return `🎵 Não encontrei eventos para sua busca.

Tente:
• "Shows hoje"
• "Música ao vivo no fim de semana"
• "Eventos na Vila Olimpia"
• "Jazz bars São Paulo"

📱 No app você pode salvar seus eventos favoritos!`;
  }

  const eventsList = events.slice(0, 4).map(e => `
🎵 *${e.title}*
📍 ${e.restaurant.name} - ${e.location}
📅 ${e.date} às ${e.time}
🎤 ${e.artist || 'Música ao vivo'}
💰 ${e.cover ? `Cover: R$ ${e.cover}` : 'Entrada gratuita'}
${e.needsReservation ? '📞 Requer reserva' : '🚶 Chegada livre'}
  `).join('\n---\n');

  return `${eventsList}

📱 *Baixe o FoodConnect* para:
• ✅ Fazer reservas instantâneas
• 🔔 Receber alertas dos seus artistas favoritos
• 🎫 Garantir mesa nos melhores eventos

👉 foodconnect.app/download`;
}
```

### **3. Sistema de Onboarding Inteligente**

```typescript
private async handleAppDownload(phoneNumber: string) {
  // Salva lead para remarketing
  await this.saveWhatsAppLead({
    phone: phoneNumber,
    source: 'whatsapp_bot',
    timestamp: new Date(),
    interest: 'app_download'
  });

  return `🎉 *Bem-vindo ao FoodConnect!*

📱 *iOS*: apps.apple.com/foodconnect
📱 *Android*: play.google.com/foodconnect

🎁 *OFERTA ESPECIAL*: Use o código *WHATSAPP10* no seu primeiro pedido e ganhe 10% de desconto!

O que você pode fazer no app:
✅ Fazer pedidos e reservas
✅ Ver cardápios completos com fotos
✅ Acompanhar entrega em tempo real
✅ Feed social gastronômico
✅ Recomendações personalizadas com IA
✅ Programa de fidelidade

Após baixar, mande "PRONTO" que eu te ajudo com os primeiros passos! 😊`;
}

private async handlePostDownloadAssistance(phoneNumber: string) {
  return `👏 Parabéns por baixar o FoodConnect!

🚀 *Primeiros passos*:
1️⃣ Confirme seu número ${phoneNumber}
2️⃣ Adicione sua localização
3️⃣ Escolha suas preferências culinárias
4️⃣ Explore o feed gastronômico

🎁 Não esquece do seu cupom: *WHATSAPP10*

💬 Se tiver dúvidas, estou aqui! Pode perguntar sobre qualquer restaurante da sua região.`;
}
```

### **4. Limitações Estratégicas (Não Transacional)**

```typescript
private async handleTransactionalRequest(request: string, phoneNumber: string) {
  const isRegistered = await this.checkUserExists(phoneNumber);

  const responses = {
    reservation: `📞 Para fazer *reservas*, você precisa usar o app FoodConnect!

No app você pode:
• ✅ Ver disponibilidade em tempo real
• ✅ Escolher mesa e horário
• ✅ Receber confirmação instantânea
• ✅ Cancelar ou alterar quando quiser

${isRegistered ?
  '📱 Abra o app agora!' :
  '📱 Baixe: foodconnect.app/download'
}`,

    order: `🛍️ Para fazer *pedidos*, use o app FoodConnect!

Vantagens do app:
• 🍕 Cardápio completo com fotos
• 💳 Pagamento seguro integrado
• 🚚 Acompanhamento em tempo real
• 🎁 Cupons e promoções exclusivas

${isRegistered ?
  '📱 Abra o app e aproveite!' :
  '📱 Baixe: foodconnect.app/download\n🎁 Use WHATSAPP10 para 10% OFF'
}`,

    payment: `💰 Pagamentos são processados de forma *100% segura* apenas no app!

Por aqui posso apenas informar sobre:
• 📍 Restaurantes e localizações
• 🎵 Eventos e música ao vivo
• ⭐ Avaliações e horários
• 🍽️ Tipos de culinária

📱 Para compras: ${isRegistered ? 'Abra o app!' : 'foodconnect.app/download'}`
  };

  return responses[this.classifyTransactionalType(request)] || responses.payment;
}
```

### **5. Remarketing e Nutrição de Leads**

```typescript
@Injectable()
export class WhatsAppLeadNurtureService {
  @Cron("0 10 * * *") // Todo dia às 10h
  async sendDailyRecommendations() {
    const leads = await this.getActiveWhatsAppLeads();

    for (const lead of leads) {
      const daysSinceFirstContact = this.getDaysSince(lead.createdAt);

      if (daysSinceFirstContact === 1) {
        await this.sendFollowUpMessage(lead);
      } else if (daysSinceFirstContact === 3) {
        await this.sendEventRecommendation(lead);
      } else if (daysSinceFirstContact === 7) {
        await this.sendSpecialOffer(lead);
      }
    }
  }

  private async sendFollowUpMessage(lead: WhatsAppLead) {
    return this.whatsapp.sendMessage(
      lead.phone,
      `
Oi! Tudo bem? 😊

Ontem você perguntou sobre restaurantes aqui no WhatsApp. 

🎁 *LEMBRETE*: Seu cupom WHATSAPP10 ainda está válido para o primeiro pedido no app!

Hoje tem algumas sugestões especiais na sua região:
${await this.getTodayHighlights(lead.location)}

📱 App: foodconnect.app/download

Se quiser parar de receber essas dicas, só mandar "PARAR".
    `
    );
  }
}
```

### **6. Analytics e Métricas do WhatsApp Bot**

```typescript
interface WhatsAppBotMetrics {
  // Métricas de Engajamento
  dailyActiveUsers: number;
  messageVolume: number;
  responseTime: number; // tempo médio de resposta

  // Métricas de Conversão
  appDownloadRate: number; // % que baixou o app
  registrationRate: number; // % que se cadastrou
  firstOrderRate: number; // % que fez primeiro pedido

  // Métricas de Conteúdo
  topQueries: string[]; // perguntas mais frequentes
  popularRestaurants: string[]; // restaurantes mais consultados
  eventInterest: number; // interesse em eventos

  // Métricas de Retenção
  returnUserRate: number; // % que volta a perguntar
  leadNurtureSuccess: number; // % convertido via follow-up
}

// Relatório semanal automatizado
@Cron('0 9 * * 1') // Segunda às 9h
async generateWeeklyReport() {
  const metrics = await this.calculateMetrics();

  // Envia relatório para equipe de marketing
  await this.sendReport({
    conversions: metrics.appDownloadRate,
    topQuestions: metrics.topQueries,
    improvements: await this.suggestImprovements(metrics)
  });
}
```

**Exemplos de Conversas Típicas:**

**Usuário**: "Onde tem pizza boa na Paulista?"
**Bot**: 🍕 Encontrei 3 pizzarias excelentes na Av. Paulista: [lista com detalhes]... 📱 Baixe o app para fazer pedidos: foodconnect.app/download

**Usuário**: "Tem show hoje?"
**Bot**: 🎵 Hoje tem 4 eventos com música ao vivo: [lista com detalhes]... 📱 No app você pode fazer reservas instantâneas!

**Usuário**: "Quero fazer uma reserva"
**Bot**: 📞 Para reservas, use o app FoodConnect! Lá você vê disponibilidade em tempo real... [incentivo ao download]

**Fluxo de Aquisição:**

1. **Primeiro contato**: Informação + CTA sutil para download
2. **Interesse demonstrado**: Informação + oferta especial (WHATSAPP10)
3. **Download confirmado**: Onboarding assistido via WhatsApp
4. **Follow-up**: Nutrição com dicas e ofertas exclusivas

**ROI Esperado:**

- **Custo**: ~R$ 200/mês (Twilio WhatsApp + OpenAI)
- **Conversão**: 15-25% dos consultantes baixam o app
- **LTV**: R$ 150-300 por usuário convertido
- **ROI**: 300-500% nos primeiros 6 meses

  10.7. Serviço de Notificações
  **Bibliotecas Core (Priorizadas para o Brasil):**- **`twilio`** - WhatsApp Business API (PRINCIPAL no Brasil)

- **`@wppconnect/wppconnect`** - WhatsApp Web API alternativa
- **`whatsapp-web.js`** - Biblioteca popular para WhatsApp Web
- `firebase-admin` - Push notifications via FCM (secundário)
- `@nestjs-modules/mailer` + `nodemailer` - Emails (confirmações)
- `handlebars` - Templates para WhatsApp e email
- `@nestjs/bull` - Queue para notificações assíncronas
- `@nestjs/websockets` + `socket.io` - Notificações real-time no app

**Hierarquia de Canais para o Brasil:**

1. **WhatsApp** (95% dos usuários) - Confirmações, status, promoções
2. **Push Notifications** - Notificações urgentes no app
3. **Email** - Confirmações formais e recibos
4. **SMS** - Apenas fallback se WhatsApp falhar

**Exemplos de uso:**

```typescript
// WhatsApp com Twilio
const twilioClient = twilio(accountSid, authToken);

await twilioClient.messages.create({
  from: "whatsapp:+5511999999999",
  to: `whatsapp:${userPhone}`,
  body: `🍽️ *FoodConnect*\n\nOlá ${userName}!\n\nSeu pedido #${orderId} foi confirmado!\n\n📍 Restaurante: ${restaurantName}\n⏰ Tempo estimado: ${estimatedTime}\n💰 Total: R$ ${totalValue}\n\nAcompanhe em tempo real pelo app! 📱`,
});

// Template estruturado para WhatsApp
const whatsappTemplate = {
  orderConfirmed: (data) => `
🍽️ *${data.restaurantName}*

✅ Pedido #${data.orderId} confirmado!

📋 *Itens:*
${data.items.map((item) => `• ${item.name} x${item.quantity}`).join("\n")}

⏰ Tempo estimado: ${data.estimatedTime}
💰 Total: R$ ${data.total}

Obrigado pela preferência! 🙏
  `,

  orderReady: (data) => `
🔔 *Pedido Pronto!*

Seu pedido #${data.orderId} está pronto para retirada!

📍 ${data.restaurantAddress}
⏰ Retire até: ${data.pickupDeadline}

Apresente este código: *${data.pickupCode}*
  `,
};
```

10.7. Serviço de Fidelidade & Promoções
**Bibliotecas Core:**

- `json-rules-engine` - Engine de regras de negócio
- `@nestjs/bull` - Processamento assíncrono de pontos
- `crypto` + `qr-image` - Geração segura de cupons
- `decimal.js` - Cálculos monetários precisos
- `date-fns` - Validação de datas de promoções
- `@nestjs/cache-manager` - Cache para pontuações
- `@nestjs/schedule` - Eventos temporais de gamificação

**Exemplo de uso:**

```typescript
// Rules engine para promoções
const engine = new Engine();
engine.addRule({
  conditions: {
    all: [
      {
        fact: "orderValue",
        operator: "greaterThan",
        value: 50,
      },
    ],
  },
  event: { type: "apply-discount", params: { discount: 0.1 } },
});
```

10.8. Bibliotecas Transversais (Todos os Serviços)
**Observabilidade:**

- `@nestjs/terminus` - Health checks
- `@nestjs/metrics` + `prometheus` - Métricas
- `winston` - Logging estruturado
- `@sentry/node` - Error tracking

**Segurança:**

- `helmet` - Headers de segurança HTTP
- `@nestjs/throttler` - Rate limiting
- `express-rate-limit` - Limitação adicional
- `joi` ou `yup` - Validação de schemas

**Performance:**

- `@nestjs/cache-manager` - Cache universal
- `compression` - Compressão HTTP
- `@nestjs/bull` - Background jobs

**Testes:**

- `jest` - Framework de testes
- `supertest` - Testes de API
- `@nestjs/testing` - Utilitários de teste
- `factory-girl` - Factories para testes

  10.9. Estratégia de Comunicação para o Mercado Brasileiro
  **Contexto Cultural:**
  No Brasil, o WhatsApp é o canal de comunicação dominante, sendo usado por mais de 95% da população com smartphone. Esta realidade cultural deve ser o centro da estratégia de notificações do FoodConnect.

**Arquitetura de Comunicação Recomendada:**

```typescript
// Service de comunicação multi-canal
@Injectable()
export class CommunicationService {
  async sendOrderNotification(order: Order, type: NotificationType) {
    const promises = [];

    // 1. WhatsApp (PRIORIDADE MÁXIMA)
    promises.push(this.sendWhatsApp(order, type));

    // 2. Push notification (se app instalado)
    if (order.user.hasAppInstalled) {
      promises.push(this.sendPushNotification(order, type));
    }

    // 3. Email (apenas para confirmações formais)
    if (type === "ORDER_CONFIRMED" || type === "RECEIPT") {
      promises.push(this.sendEmail(order, type));
    }

    await Promise.allSettled(promises);
  }
}
```

**Templates Específicos para o Brasil:**

1. **Linguagem Calorosa e Pessoal**

```typescript
const brazilianTemplates = {
  welcome: `Olá ${name}! 😊 
Seja bem-vindo(a) ao FoodConnect! 
Aqui você encontra os melhores restaurantes da sua região. 
Bom apetite! 🍽️`,

  orderConfirmed: `${name}, seu pedido foi confirmado! 🎉
Restaurante: ${restaurant}
Pedido: ${orderId}
Previsão: ${time}
Acompanhe tudo por aqui! 📱`,

  promotions: `🔥 Oferta especial para você!
${discount}% OFF no ${restaurant}
Válido até ${date}
Corre que é por tempo limitado! ⏰`,
};
```

2. **Uso Estratégico de Emojis e Formatação**
   - Emojis para criar proximidade e facilitar leitura
   - **Negrito** para informações importantes
   - Quebras de linha para melhor legibilidade no WhatsApp

**Integrações Recomendadas:**

1. **Twilio WhatsApp Business API** (Oficial)

   - Mais confiável e escalável
   - Templates pré-aprovados pelo WhatsApp
   - Métricas detalhadas de entrega

2. **WPPConnect** (Alternativa)
   - Mais barato para MVP
   - Maior flexibilidade inicial
   - Cuidado com limites e bloqueios

**Estratégia de Onboarding Brasileiro:**

```typescript
const onboardingFlow = {
  step1: "Confirme seu WhatsApp para receber atualizações",
  step2: "Escolha seus tipos de restaurante favoritos",
  step3: "Defina sua localização para ofertas próximas",
  step4: "Primeira oferta especial de boas-vindas! 🎁",
};
```

**Compliance e Boas Práticas:**

- Sempre pedir consentimento para WhatsApp marketing
- Respeitar horários comerciais (8h-22h)
- Oferecer opt-out simples: "Digite SAIR para não receber mais"
- Personalizar horários por região (fuso horário)

**Métricas Importantes para o Brasil:**

- Taxa de leitura WhatsApp (geralmente >90%)
- Taxa de resposta em WhatsApp
- Conversão WhatsApp → Pedido
- NPS específico por canal de comunicação

11. Guia de Comandos para o GitHub Copilot
    Use esta seção como um roteiro de prompts para o Copilot no VS Code, organizados pelas fases do projeto.

Fase 0: Preparação
No terminal (para ter os arquivos):

touch README.md .gitignore

mkdir docs && touch docs/api.yaml

No arquivo .gitignore: Peça ao Copilot para gerar um template para Node.js:

"// Generate a standard .gitignore file for a Node.js project, including node_modules, .env files, and build artifacts"

No arquivo README.md: Peça uma estrutura inicial:

"// Create a README structure for the FoodConnect backend project, with sections for: Project Description, Technologies Used, Getting Started (Installation, Running the app), and API Documentation"

No arquivo docs/api.yaml: Peça um exemplo de OpenAPI para o endpoint de login:

"// Create an OpenAPI 3.0 specification for a user login endpoint at /auth/login. It should be a POST request taking email and password, and returning a JWT access token."

Fase 1: Construindo o Monolito (Backend com NestJS e Prisma)
No terminal (usando Nest CLI e Prisma CLI):

nest new foodconnect-api

npm install @prisma/client

npx prisma init --datasource-provider postgresql

Gerando Módulos (no terminal):

nest g module auth

nest g module users

nest g module restaurants

(Repita para menus, orders, etc.)

Definindo o Schema do Prisma (prisma/schema.prisma): Escreva os modelos um por um. O Copilot é excelente em autocompletar relações.

"// Create a Prisma model for User with fields: id, email, password, name, role (CLIENT or RESTAURANT_OWNER). The email should be unique."
"// Create a Prisma model for Restaurant with fields: id, name, address, openingHours. Add a one-to-many relation with a User (the owner)."
"// Create a Prisma model for MenuItem with fields: id, name, description, price, and a relation to its Restaurant."

Implementando Endpoints CRUD: Abra o arquivo do controller de um módulo (ex: restaurants.controller.ts).

"// Create a NestJS controller for the Restaurants module with standard CRUD endpoints for creating, finding all, finding one by id, updating, and deleting a restaurant."
"// Use DTOs (Data Transfer Objects) for create and update operations to validate the request body. Use the class-validator library."
"// Inject the RestaurantsService to handle the business logic."

Implementando a Lógica no Service: Abra o arquivo de serviço (restaurants.service.ts).

"// Inject the PrismaService. Implement the create method, which takes a CreateRestaurantDto and uses prisma.restaurant.create to save the data."
"// Implement the findAll method, which uses prisma.restaurant.findMany."

Implementando Autenticação JWT: No auth.module.ts.

"// Configure the JWT module in this NestJS module. Set a secret and an expiration time. Import the UsersModule."
"// In the AuthService, create a login method that validates the user's password and, if valid, returns a signed JWT token."
"// Create a JWT strategy for Passport.js to validate the token on protected routes."
"// In the AuthController, create a POST endpoint for /login."
"// In the RestaurantsController, protect the POST, PATCH, and DELETE endpoints using the AuthGuard('jwt')."

Fase 2: Frontends Essenciais (React e React Native)
Dashboard do Estabelecimento (React.js):

Criando um serviço de API: Crie um arquivo src/services/api.js.

"// Create an Axios instance for the API service. Set the baseURL to the backend server address."
"// Create an async function loginUser(email, password) that makes a POST request to /auth/login and returns the response data."
"// Create a function getRestaurants() that makes a GET request to /restaurants."

Criando Componentes: Em um novo arquivo de componente (ex: src/components/LoginForm.js).

"// Create a React functional component for a login form with email and password fields using useState hooks."
"// On form submission, call the loginUser service function and handle the success or error response. On success, store the token in local storage and redirect the user."
"// Create a component to display a list of menu items. It should accept an array of items as a prop and render them."

App do Cliente (React Native): O processo é muito similar.

Configurando a Navegação: Em App.js ou navigation/AppNavigator.js.

"// Set up a stack navigator using React Navigation with screens for Home, RestaurantDetails, and MyOrders."

Criando Telas: Em um novo arquivo de tela (ex: screens/HomeScreen.js).

"// Create a React Native screen component that fetches a list of restaurants from the API using a service function when the component mounts (useEffect)."
"// Display the restaurants in a FlatList, where each item is a pressable card that navigates to the RestaurantDetails screen with the restaurant ID as a parameter."
