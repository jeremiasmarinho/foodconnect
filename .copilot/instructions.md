# 🤖 GitHub Copilot - Instruções de Desenvolvimento FoodConnect

> Este arquivo define os padrões, convenções e instruções que o GitHub Copilot deve seguir ao gerar código para o projeto FoodConnect.

## 🎯 Contexto do Projeto

**FoodConnect** é uma plataforma de descoberta social gastronômica que combina:
- Feed social estilo Instagram para comida
- IA concierge para recomendações personalizadas  
- WhatsApp Bot para aquisição de leads
- Sistema de pedidos/reservas (fase futura)

**Arquitetura**: Monolito Modular NestJS evoluindo para Microsserviços
**Foco**: Validação da hipótese social em 90 dias

## 📋 Convenções de Código

### **Linguagens e Frameworks**
- **Backend**: TypeScript + NestJS
- **Database**: PostgreSQL + TypeORM
- **Frontend**: React Native (futuro)
- **Styling**: Seguir padrões do Airbnb TypeScript

### **Estrutura de Arquivos**
```
src/
├── auth/           # Autenticação e autorização
├── users/          # Gerenciamento de usuários
├── restaurants/    # Perfis de restaurantes  
├── feed/           # Posts sociais e interações
├── search/         # Busca semântica + recomendações
├── leads/          # Captura via WhatsApp
├── analytics/      # Métricas e eventos
└── shared/         # Utilities e DTOs compartilhados
```

### **Naming Conventions**
- **Files**: kebab-case (`user-profile.service.ts`)
- **Classes**: PascalCase (`UserProfileService`)
- **Methods**: camelCase (`getUserProfile()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Interfaces**: PascalCase com `I` prefix (`IUserRepository`)
- **DTOs**: PascalCase + suffix (`CreateUserDto`)
- **Entities**: PascalCase (`User`, `Post`, `Restaurant`)

### **Padrões de Nomenclatura Específicos**
```typescript
// ✅ Correto
export class UserService {
  async getUserById(id: string): Promise<User> {}
  async createUser(dto: CreateUserDto): Promise<User> {}
  async updateUserProfile(id: string, dto: UpdateUserDto): Promise<User> {}
}

// ❌ Evitar
export class userservice {
  async get_user(id) {}
  async create(data) {}
}
```

## 🏗️ Padrões Arquiteturais

### **Domain-Driven Design (DDD)**
Organize código seguindo domínios de negócio:

```typescript
// Domain Layer
export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    public readonly profile: UserProfile
  ) {}
  
  public updateProfile(newProfile: UserProfile): void {
    // Business logic here
    this.profile = newProfile;
  }
}

// Application Layer  
@Injectable()
export class UserService {
  constructor(private userRepository: IUserRepository) {}
  
  async executeCreateUser(command: CreateUserCommand): Promise<User> {
    // Orchestration logic
  }
}
```

### **Event-Driven Architecture**
Use eventos de domínio para desacoplamento:

```typescript
// Event Definition
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

// Event Handler
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler {
  async handle(event: UserRegisteredEvent) {
    // Handle side effects
  }
}
```

### **Repository Pattern**
Abstraia acesso a dados:

```typescript
// Interface
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}

// Implementation
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}
  
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

## 🎯 Padrões Específicos do FoodConnect

### **Feed Social - Padrões**
```typescript
// Post Entity
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  content: string;
  
  @Column('simple-array')
  tags: string[];
  
  @Column({ type: 'enum', enum: PostType })
  type: PostType;
  
  @CreateDateColumn()
  createdAt: Date;
  
  // Sempre incluir métrica de engajamento
  @OneToMany(() => PostInteraction, interaction => interaction.post)
  interactions: PostInteraction[];
}
```

### **IA e Recomendações - Padrões**
```typescript
// Service para IA sempre com interface
export interface IRecommendationService {
  generateRecommendations(userId: string, context: RecommendationContext): Promise<Recommendation[]>;
}

@Injectable()
export class SemanticRecommendationService implements IRecommendationService {
  async generateRecommendations(userId: string, context: RecommendationContext): Promise<Recommendation[]> {
    // Sempre logar entrada e saída para debugging
    this.logger.log(`Generating recommendations for user ${userId}`, { context });
    
    const recommendations = await this.computeRecommendations(userId, context);
    
    this.logger.log(`Generated ${recommendations.length} recommendations`, { userId });
    return recommendations;
  }
}
```

### **WhatsApp Bot - Padrões**
```typescript
// Handler de mensagens sempre com type safety
export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: Date;
}

@Injectable()
export class WhatsAppBotService {
  async processMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    // Sempre validar entrada
    if (!message.from || !message.body) {
      throw new BadRequestException('Invalid WhatsApp message format');
    }
    
    // Log para analytics
    await this.analyticsService.trackEvent('whatsapp_message_received', {
      from: message.from,
      messageLength: message.body.length
    });
    
    return this.generateResponse(message);
  }
}
```

## 🔧 Padrões Técnicos Obrigatórios

### **Error Handling**
```typescript
// ✅ Sempre usar custom exceptions
export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}

// ✅ Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log + format response
  }
}
```

### **Validation**
```typescript
// ✅ Sempre usar class-validator
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences?: UserPreferencesDto;
}
```

### **Logging e Observabilidade**
```typescript
// ✅ Structured logging sempre
@Injectable()
export class SomeService {
  private readonly logger = new Logger(SomeService.name);
  
  async someMethod(param: string): Promise<void> {
    this.logger.log('Starting operation', { param, timestamp: new Date() });
    
    try {
      // operation
      this.logger.log('Operation completed successfully', { param });
    } catch (error) {
      this.logger.error('Operation failed', { param, error: error.message });
      throw error;
    }
  }
}
```

### **Database Queries**
```typescript
// ✅ Sempre otimizar queries
@Injectable()
export class PostService {
  async getFeedPosts(userId: string, limit: number = 20): Promise<Post[]> {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.interactions', 'interaction', 'interaction.userId = :userId', { userId })
      .where('post.isActive = :isActive', { isActive: true })
      .orderBy('post.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
```

## 🎯 Métricas e Analytics (Obrigatório)

Todo método importante deve gerar métricas:

```typescript
@Injectable()
export class MetricsService {
  async trackEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    // Implementação de tracking
  }
}

// Uso em services
@Injectable()
export class FeedService {
  async createPost(dto: CreatePostDto): Promise<Post> {
    const post = await this.postRepository.save(dto);
    
    // ✅ SEMPRE trackear eventos importantes
    await this.metricsService.trackEvent('post_created', {
      postId: post.id,
      authorType: post.authorType,
      tags: post.tags,
      hasMedia: !!post.mediaUrl
    });
    
    return post;
  }
}
```

## 🚨 Regras Críticas

### **❌ Nunca Fazer**
- Queries N+1 sem justificativa
- Hardcode de strings (usar constants)
- Exceptions genéricas (`throw new Error()`)
- Logs sem estrutura (`console.log()`)
- Endpoints sem validação de input
- Operações assíncronas sem tratamento de erro
- Código sem type safety

### **✅ Sempre Fazer**
- Validar inputs com DTOs
- Logar operações importantes
- Usar interfaces para contratos
- Implementar error handling específico
- Otimizar queries de banco
- Trackear métricas de negócio
- Documentar APIs com Swagger decorators

## 🎨 Convenções de Comentários

```typescript
/**
 * Calcula recomendações personalizadas para o usuário baseado em:
 * - Histórico de interações
 * - Preferências declaradas  
 * - Contexto geográfico
 * - Sentiment analysis dos posts curtidos
 * 
 * @param userId - ID único do usuário
 * @param context - Contexto adicional (localização, hora, etc.)
 * @returns Array de recomendações ordenadas por relevância
 * 
 * @example
 * ```typescript
 * const recs = await service.generateRecommendations('user-123', {
 *   location: { lat: -23.5505, lng: -46.6333 },
 *   timeOfDay: 'evening'
 * });
 * ```
 */
async generateRecommendations(userId: string, context: RecommendationContext): Promise<Recommendation[]> {
  // TODO: Implementar cache para results frequentes
  // FIXME: Adicionar fallback para quando IA não responde
  // NOTE: Performance crítica - otimizar se tempo > 2s
}
```

## 📱 Padrões de Response/API

```typescript
// ✅ Response padronizado
export class ApiResponse<T> {
  constructor(
    public readonly data: T,
    public readonly message: string = 'Success',
    public readonly timestamp: Date = new Date(),
    public readonly requestId?: string
  ) {}
}

// ✅ Paginação padrão
export class PaginatedResponse<T> extends ApiResponse<T[]> {
  constructor(
    data: T[],
    public readonly pagination: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    },
    message?: string
  ) {
    super(data, message);
  }
}
```

## 🎯 Instruções para GitHub Copilot

Quando o Copilot estiver gerando código:

1. **SEMPRE** seguir os padrões definidos acima
2. **SEMPRE** incluir error handling apropriado
3. **SEMPRE** usar TypeScript strict mode
4. **SEMPRE** incluir logs estruturados para operações importantes
5. **SEMPRE** validar inputs com DTOs
6. **SEMPRE** trackear métricas para operações de negócio
7. **SEMPRE** usar interfaces para abstrações
8. **SEMPRE** incluir comentários JSDoc para métodos públicos
9. **SEMPRE** otimizar queries de banco de dados
10. **SEMPRE** seguir princípios SOLID

---

**🎯 Objetivo**: Manter consistência, qualidade e observabilidade em todo o codebase durante o desenvolvimento acelerado com IA.