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
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column("simple-array")
  tags: string[];

  @Column({ type: "enum", enum: PostType })
  type: PostType;

  @CreateDateColumn()
  createdAt: Date;

  // Sempre incluir métrica de engajamento
  @OneToMany(() => PostInteraction, (interaction) => interaction.post)
  interactions: PostInteraction[];
}
```

### **IA e Recomendações - Padrões**

```typescript
// Service para IA sempre com interface
export interface IRecommendationService {
  generateRecommendations(
    userId: string,
    context: RecommendationContext
  ): Promise<Recommendation[]>;
}

@Injectable()
export class SemanticRecommendationService implements IRecommendationService {
  async generateRecommendations(
    userId: string,
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    // Sempre logar entrada e saída para debugging
    this.logger.log(`Generating recommendations for user ${userId}`, {
      context,
    });

    const recommendations = await this.computeRecommendations(userId, context);

    this.logger.log(`Generated ${recommendations.length} recommendations`, {
      userId,
    });
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
      throw new BadRequestException("Invalid WhatsApp message format");
    }

    // Log para analytics
    await this.analyticsService.trackEvent("whatsapp_message_received", {
      from: message.from,
      messageLength: message.body.length,
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
    this.logger.log("Starting operation", { param, timestamp: new Date() });

    try {
      // operation
      this.logger.log("Operation completed successfully", { param });
    } catch (error) {
      this.logger.error("Operation failed", { param, error: error.message });
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
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect(
        "post.interactions",
        "interaction",
        "interaction.userId = :userId",
        { userId }
      )
      .where("post.isActive = :isActive", { isActive: true })
      .orderBy("post.createdAt", "DESC")
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
  async trackEvent(
    eventName: string,
    properties: Record<string, any>
  ): Promise<void> {
    // Implementação de tracking
  }
}

// Uso em services
@Injectable()
export class FeedService {
  async createPost(dto: CreatePostDto): Promise<Post> {
    const post = await this.postRepository.save(dto);

    // ✅ SEMPRE trackear eventos importantes
    await this.metricsService.trackEvent("post_created", {
      postId: post.id,
      authorType: post.authorType,
      tags: post.tags,
      hasMedia: !!post.mediaUrl,
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

````typescript
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
````

## 📱 Padrões de Response/API

```typescript
// ✅ Response padronizado
export class ApiResponse<T> {
  constructor(
    public readonly data: T,
    public readonly message: string = "Success",
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

## ⚠️ Lições Aprendidas - Evitar Erros Comuns

> Seção atualizada durante desenvolvimento para capturar e evitar erros recorrentes

### **🔧 Configuração de Ambiente e Build**

#### **Problema: NestJS CLI criando repositório git aninhado**

- **Erro**: `nest new .` cria `.git` dentro da pasta backend, impedindo commits no repo principal
- **Solução**: Sempre remover `.git` aninhado após `nest new`
- **Comando**: `Remove-Item -Recurse -Force backend/.git` (PowerShell)

#### **Problema: Branch protection impedindo push direto**

- **Erro**: Push para `main` falha por proteção de branch
- **Solução**: Sempre usar feature branches: `git checkout -b feat/nome-da-feature`
- **Fluxo**: feature branch → push → pull request → merge

#### **Problema: Context de terminal perdido no PowerShell**

- **Erro**: Comandos executados no diretório errado por navegação incorreta
- **Solução**: Sempre usar caminhos absolutos ou verificar `pwd` antes de comandos críticos
- **Exemplo**: `cd C:\Users\"Jeremias Marinho"\foodconnect\backend` ao invés de `cd backend`

### **💻 Erros de Comandos Terminal (PowerShell)**

#### **Comando: ls -la (Linux/macOS)**

- **❌ Erro**: `ls -la backend/` → "Não é possível localizar um parâmetro que coincida com o nome de parâmetro 'la'"
- **✅ Correto**: `Get-ChildItem -Force backend/` ou `dir backend/` ou `ls backend/`
- **Nota**: PowerShell usa Get-ChildItem, `-Force` mostra arquivos ocultos

#### **Comando: Navegação com espaços no path**

- **❌ Erro**: `cd C:\Users\Jeremias Marinho\foodconnect\backend` → Falha por espaço no nome
- **✅ Correto**: `cd "C:\Users\Jeremias Marinho\foodconnect\backend"` ou `cd C:\Users\"Jeremias Marinho"\foodconnect\backend`
- **Nota**: Sempre usar aspas quando path contém espaços

#### **Comando: Múltiplos comandos em sequência**

- **❌ Erro**: `cd backend && npm run start:dev` → Operador && não funciona no PowerShell
- **✅ Correto**: `cd backend; npm run start:dev` ou separar em comandos individuais
- **Nota**: PowerShell usa `;` para separar comandos, não `&&`

#### **Comando: Operador && em paths com espaços**

- **❌ Erro**: `cd C:\Users\Jeremias\ Marinho\foodconnect\backend && npx prettier` → "O token '&&' não é um separador de instruções válido"
- **✅ Correto**: Usar comandos separados ou `;` como separador
- **Exemplo**: `cd "C:\Users\Jeremias Marinho\foodconnect\backend"; npx prettier --write file.ts`

#### **Comando: Verificar se arquivo/pasta existe**

- **❌ Erro**: `[ -f backend/.git ]` → Sintaxe bash não funciona
- **✅ Correto**: `Test-Path backend/.git` ou `if (Test-Path backend/.git) { ... }`
- **Nota**: PowerShell usa cmdlets específicos para testes de path

#### **Comando: Remover pasta recursivamente**

- **❌ Erro**: `rm -rf backend/.git` → Comando Unix não reconhecido
- **✅ Correto**: `Remove-Item -Recurse -Force backend/.git` ou `rmdir /s backend\.git`
- **Nota**: PowerShell usa Remove-Item com parâmetros explícitos

#### **Comando: Verificar comandos disponíveis**

- **❌ Erro**: `which psql` → Comando Unix não existe
- **✅ Correto**: `Get-Command psql` ou `where psql` ou simplesmente `psql --version`
- **Nota**: PowerShell usa Get-Command para encontrar executáveis

#### **Comando: Scripts npm com contexto de diretório**

- **❌ Erro**: `npm run start:dev` na pasta errada → "Missing script: start:dev"
- **✅ Correto**: Sempre verificar `pwd` e navegar para pasta com package.json
- **Verificação**: `npm run` mostra scripts disponíveis no package.json atual

#### **Comando: Prisma commands**

- **❌ Erro**: `npx prisma dev` → "Unknown command 'dev'"
- **✅ Correto**: `npx prisma migrate dev --name nome-da-migration`
- **Alternativa**: `npx prisma db push` (para development sem migrations)
- **Help**: `npx prisma --help` mostra comandos disponíveis

### **🗃️ Configuração de Banco de Dados**

#### **Problema: PostgreSQL não instalado localmente**

- **Erro**: Tentativa de usar PostgreSQL sem instalação prévia
- **Solução**: Usar SQLite para desenvolvimento local ou configurar PostgreSQL via Docker
- **Configuração**: `provider = "sqlite"` no schema.prisma para dev

#### **Problema: Prisma client path incorreto**

- **Erro**: Import path `../../generated/prisma` pode falhar se não executar `prisma generate`
- **Solução**: Sempre rodar `npx prisma generate` após alterações no schema
- **Verificação**: Garantir que pasta `generated/` existe antes de imports

### **🔄 Fluxo de Commits Incrementais**

#### **Problema: Commits muito grandes sem contexto**

- **Erro**: Commit de muitas alterações simultâneas dificulta rastreamento
- **Solução**: Commits pequenos e incrementais após cada milestone
- **Padrão**: feat → test → commit → push → próxima feature

#### **Problema: Mensagens de commit genéricas**

- **Erro**: Commits como "update files" não explicam alterações
- **Solução**: Seguir formato: `tipo: descrição curta\n\n- Lista detalhada\n- Do que foi alterado`
- **Exemplo**: `feat: configure database with Prisma ORM\n\n- Add User, Restaurant models\n- Setup migrations`

### **🌿 Erros de Git Commands**

#### **Comando: Git add com repositório aninhado**

- **❌ Erro**: `git add .` → "backend/' does not have a commit checked out"
- **✅ Solução**: Remover `.git` aninhado primeiro: `Remove-Item -Recurse -Force backend/.git`
- **Prevenção**: Sempre verificar `Test-Path pasta/.git` antes de git add

#### **Comando: Push direto para branch protegida**

- **❌ Erro**: `git push origin main` → "Protected branch update failed"
- **✅ Correto**:
  ```bash
  git checkout -b feat/nome-da-feature
  git push -u origin feat/nome-da-feature
  # Depois criar PR no GitHub
  ```
- **Regra**: Nunca push direto para main, sempre usar feature branches

#### **Comando: Commit sem staging**

- **❌ Erro**: `git commit -m "message"` sem `git add` → "no changes added to commit"
- **✅ Correto**: `git add .` primeiro, depois `git commit -m "message"`
- **Verificação**: `git status` mostra o que está staged vs untracked

#### **Comando: Status de branch tracking**

- **❌ Problema**: Branch local não trackeia remote → push falha
- **✅ Correto**: `git push -u origin nome-da-branch` (primeira vez)
- **Depois**: `git push` funciona normalmente

### **🛠️ Desenvolvimento NestJS**

#### **Problema: Scripts npm não encontrados**

- **Erro**: `npm run start:dev` falhando por contexto de diretório
- **Solução**: Verificar package.json e executar no diretório correto
- **Verificação**: `npm run` lista scripts disponíveis

#### **Problema: Modules não importados no AppModule**

- **Erro**: Serviços injetados não funcionam se módulo não estiver importado
- **Solução**: Sempre adicionar novos módulos ao imports do AppModule
- **Pattern**: Criar módulo → exportar serviços → importar no AppModule

### **📁 REGRA CRÍTICA: Verificação de Diretório**

#### **Problema: Comandos executados no diretório errado**

- **❌ Erro Comum**: Executar `npm run start:dev` na raiz ao invés do `/backend`
- **❌ Consequência**: "Missing script: start:dev" ou execução em contexto errado
- **✅ Solução OBRIGATÓRIA**: SEMPRE verificar diretório antes de qualquer comando

#### **Protocolo Obrigatório para Comandos Terminal:**

```typescript
// ✅ SEMPRE seguir esta sequência:
// 1. Verificar diretório atual
run_in_terminal("pwd");

// 2. Se não estiver no diretório correto, navegar
run_in_terminal('cd "C:UsersJeremias Marinho\foodconnect\backend"');

// 3. Então executar o comando desejado
run_in_terminal("npm run start:dev");
```

#### **Diretórios por Tipo de Comando:**

- **npm scripts**: Sempre executar em `/backend` (onde está package.json)
- **git commands**: Sempre executar em `/` (raiz do projeto)
- **prisma commands**: Sempre executar em `/backend` (onde está schema.prisma)
- **nest commands**: Sempre executar em `/backend`

#### **Comando de Verificação Rápida:**

```bash
# ✅ Para verificar se está no lugar certo:
pwd  # Mostra diretório atual
ls   # Lista arquivos (deve mostrar package.json para npm, .git para git)
```

#### **Padrão de Segurança:**

```typescript
// ✅ SEMPRE usar caminhos absolutos quando em dúvida:
run_in_terminal(
  'cd "C:UsersJeremias Marinho\foodconnect\backend"; npm run start:dev'
);

// Ao invés de assumir contexto:
run_in_terminal("npm run start:dev"); // ❌ Pode falhar se não estiver no backend
```

#### **🚨 REGRA CRÍTICA: Preservação de Aplicações em Execução**

**PROBLEMA**: Executar novos comandos no terminal interrompe aplicações que estão rodando (servers, watch mode, etc.)

**REGRA OBRIGATÓRIA**: NUNCA execute comandos em terminal que já possui aplicação rodando

```typescript
// ❌ ERRADO: Isso mata o servidor que está rodando
// Terminal já tem npm run start:dev executando
run_in_terminal("npm run test"); // Mata o servidor!

// ✅ CORRETO: Usar terminal separado
// 1. Manter servidor rodando no terminal atual
// 2. Abrir novo terminal para testes
run_in_terminal("powershell -Command 'npm run test'"); // Novo processo
```

**PROTOCOLO OBRIGATÓRIO para Testes em Servidor Ativo:**

1. **Identificar se servidor está rodando**: Checar logs do terminal ativo
2. **Se servidor ativo**: NUNCA usar `run_in_terminal` no mesmo processo
3. **Para testes**: Usar `powershell -Command` ou explicar necessidade de novo terminal
4. **Documentar**: "⚠️ Servidor deve continuar rodando em terminal separado"

**Comandos Seguros para Servidor Ativo:**

```typescript
// ✅ Testes via novo processo PowerShell
run_in_terminal("powershell -Command 'cd backend; npm run test'");

// ✅ Curl/Invoke-RestMethod para testar APIs
run_in_terminal(
  "powershell -Command 'Invoke-RestMethod http://localhost:3000'"
);

// ✅ Verificações que não interrompem
run_in_terminal("Get-Process -Name node"); // Verificar se servidor roda
```

**IDENTIFICAR Servidor Ativo:**

```bash
# Sinais de que servidor está rodando:
# - "[Nest] Application successfully started"
# - "Listening on port 3000"
# - "Compilation in watch mode"
# - Processo não finalizou (sem "Command exited")
```

**NUNCA FAZER quando servidor ativo:**

- `npm run [qualquer-script]`
- `cd [qualquer-pasta]`
- Qualquer comando que aguarda input
- Comandos de build/test diretamente

**SEMPRE FAZER:**

- Usar `powershell -Command` para novos processos
- Manter servidor intacto durante testes
- Informar usuário quando servidor precisa continuar

## 💰 Estratégia de Orçamento Limitado - Análise de Bibliotecas

> **REGRA CRÍTICA**: Fase de testes/validação requer máxima eficiência de custo e tempo

### **🔍 Análise Obrigatória Antes de Implementar**

#### **Para CADA funcionalidade, SEMPRE perguntar:**

1. **Existe biblioteca consolidada?**

   - Buscar no npm: `npm search [funcionalidade]`
   - Verificar downloads semanais (>100k = consolidada)
   - Checar última atualização (<6 meses = mantida)

2. **Biblioteca vs Implementação própria:**

   - **Biblioteca**: Se >80% das necessidades atendidas
   - **Custom**: Se requisitos muito específicos
   - **Híbrido**: Biblioteca + customizações pontuais

3. **Análise de custo-benefício:**
   - **Tempo implementação custom** vs **tempo integração biblioteca**
   - **Manutenção futura** vs **dependência externa**
   - **Orçamento disponível** vs **time-to-market**

#### **Exemplos Práticos por Funcionalidade:**

**🔐 Autenticação JWT:**

- ❌ **Custom**: 2-3 dias desenvolvimento + testes de segurança
- ✅ **Biblioteca**: `@nestjs/jwt` + `passport` = 4-6 horas
- **Decisão**: Usar biblioteca consolidada

**📧 Email Service:**

- ❌ **Custom**: Implementar SMTP, templates, queues
- ✅ **Biblioteca**: `@nestjs-modules/mailer` ou Resend API
- **Decisão**: Biblioteca + API externa

**📱 WhatsApp Integration:**

- ❌ **Custom**: Implementar WhatsApp Business API do zero
- ✅ **Biblioteca**: `whatsapp-web.js` ou Twilio SDK
- **Decisão**: Biblioteca para prototipação rápida

**🤖 IA/ML Features:**

- ❌ **Custom**: Treinar modelos próprios
- ✅ **API Externa**: OpenAI, Anthropic, Hugging Face
- **Decisão**: APIs durante validação, custom após scale

**💳 Pagamentos:**

- ❌ **Custom**: Implementar processamento próprio
- ✅ **Biblioteca**: Stripe SDK, PagSeguro
- **Decisão**: Sempre usar SDKs consolidados

### **📊 Critérios de Avaliação de Bibliotecas**

```typescript
// Template para análise de bibliotecas
interface LibraryEvaluation {
  name: string;
  weeklyDownloads: number; // >100k = Popular
  lastUpdated: string; // <6 meses = Mantida
  githubStars: number; // >1k = Confiável
  openIssues: number; // <100 = Bem mantida
  documentation: "Poor" | "Good" | "Excellent";
  learningCurve: "Low" | "Medium" | "High";
  bundleSize: string; // <100kb = Aceitável
  features: string[]; // % de cobertura das necessidades
  alternatives: string[]; // Outras opções avaliadas
  recommendation: "Use" | "Avoid" | "Consider";
  reasoning: string;
}
```

### **💡 Estratégias de Implementação Rápida**

#### **Tier 1 - Funcionalidades Core (Usar bibliotecas sempre)**

- Autenticação/Autorização
- Validação de dados
- ORM/Database
- Logging/Monitoring
- Email/SMS
- File upload/storage

#### **Tier 2 - Funcionalidades Business (Avaliar caso a caso)**

- Recomendações IA
- Feed algoritmo
- Search/Filtros
- Analytics/Métricas

#### **Tier 3 - Funcionalidades Diferencial (Custom quando necessário)**

- UX específica do FoodConnect
- Algoritmos proprietários
- Integrações únicas

### **⚡ Checklist Rápido de Decisão**

```
□ Funcionalidade está no Tier 1? → Usar biblioteca
□ Biblioteca tem >50k downloads/semana? → Considerar
□ Última atualização <6 meses? → OK para usar
□ Documentação clara e exemplos? → OK para usar
□ Cobre >80% dos requisitos? → Usar biblioteca
□ Time-to-market crítico? → Priorizar biblioteca
□ Orçamento <$10k? → Maximizar bibliotecas
□ Equipe <3 pessoas? → Maximizar bibliotecas
```

### **📝 Documentação de Decisões**

Sempre documentar decisões de bibliotecas:

```typescript
/**
 * DECISION LOG: Authentication Implementation
 *
 * Analysis Date: 2025-10-02
 * Options Evaluated:
 * 1. Custom JWT implementation - 3 days dev time
 * 2. @nestjs/jwt + passport - 6 hours integration
 * 3. Auth0 integration - 4 hours + $25/month
 *
 * Decision: Option 2 (@nestjs/jwt + passport)
 * Reasoning:
 * - Fast implementation (6h vs 3 days)
 * - Battle-tested security
 * - Zero monthly cost
 * - Full control over auth flow
 *
 * Alternative for future: Migrate to Auth0 when user base > 1000
 */
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
11. **SEMPRE** verificar contexto de diretório antes de comandos
12. **SEMPRE** usar feature branches para desenvolvimento
13. **SEMPRE** fazer commits incrementais após cada milestone
14. **SEMPRE** verificar se módulos estão importados no AppModule
15. **SEMPRE** avaliar bibliotecas consolidadas antes de implementar custom
16. **SEMPRE** priorizar time-to-market em fase de validação
17. **SEMPRE** documentar decisões de arquitetura e bibliotecas
18. **SEMPRE** executar `pwd` antes de comandos críticos de terminal
19. **SEMPRE** usar caminhos absolutos quando em dúvida sobre contexto
20. **SEMPRE** auto-documentar erros de terminal descobertos durante desenvolvimento

### **📋 REGRA CRÍTICA: Auto-Documentação de Erros Terminal**

**Sempre que ocorrer um erro de terminal e você descobir a solução:**

1. **Imediatamente** adicione o erro à seção "Lições Aprendidas - Evitar Erros Comuns"
2. **Formato obrigatório**:

   ```markdown
   #### **Comando: [Descrição do comando que falhou]**

   - **❌ Erro**: `comando errado` → "mensagem de erro"
   - **✅ Correto**: `comando correto` ou abordagem correta
   - **Nota**: Explicação do motivo e como evitar
   ```

3. **Commit imediato** das instruções atualizadas com mensagem: `docs: add terminal error [tipo do erro] to instructions`

**Objetivo**: Construir uma base de conhecimento cumulativa que evite repetir os mesmos erros, acelerando o desenvolvimento e reduzindo frustrações.

## 🚨 Lições Aprendidas - Evitar Erros Comuns

### **Erros de Terminal e Navegação**

#### **Comando: Executar scripts npm em subdiretórios**

- **❌ Erro**: `npm run start:dev` na pasta raiz → `npm error Missing script: "start:dev"`
- **✅ Correto**: `cd .\backend\; npm run start:dev` ou verificar contexto com `pwd` primeiro
- **Nota**: PowerShell executa comandos no diretório atual. Sempre confirmar contexto antes de executar scripts npm específicos de subprojetos.

#### **Comando: Navegação entre projetos monorepo**

- **❌ Erro**: Assumir diretório correto sem verificação
- **✅ Correto**: Sempre usar `pwd` ou `Get-Location` antes de comandos críticos
- **Nota**: Em monorepos, o contexto de diretório é crítico. Frontend e Backend têm package.json separados com scripts diferentes.

### **Comandos PowerShell - Navegação Confiável**

#### **Comando: Manter contexto de diretório no PowerShell**

- **❌ Erro**: `cd pasta; comando` → contexto não persiste entre comandos
- **✅ Correto**: Use `Push-Location`, `Set-Location -PassThru`, ou múltiplos comandos separados
- **Exemplos**:

  ```powershell
  # ❌ Não funciona consistentemente
  cd .\backend\; npm run start:dev

  # ✅ Métodos corretos
  Push-Location .\backend\; npm run start:dev; Pop-Location
  Set-Location .\backend\; npm run start:dev

  # ✅ Verificação antes da execução
  Push-Location .\backend\
  Get-Location  # Confirma contexto
  npm run start:dev
  Pop-Location
  ```

- **Nota**: PowerShell pode resetar contexto entre comandos. Use `Push-Location`/`Pop-Location` para navegação segura ou `Set-Location` explícito.

#### **Comando: Verificação de contexto obrigatória**

- **❌ Erro**: Executar comandos npm sem verificar diretório
- **✅ Correto**: Sempre verificar contexto antes de npm scripts
- **Padrão obrigatório**:
  ```powershell
  Get-Location        # 1. Verificar onde estou
  Set-Location .\pasta\  # 2. Navegar explicitamente
  Get-Location        # 3. Confirmar navegação
  npm run comando     # 4. Executar comando
  ```
- **Nota**: "Missing script" errors são sempre problemas de contexto. package.json está em diretório específico.

#### **ERRO CRÍTICO: PowerShell Context Reset Bug**

- **❌ Problema**: `Set-Location .\backend\` não persiste contexto entre comandos do terminal
- **🔍 Sintoma**: Terminal mostra `PS C:\Users\Jeremias Marinho\foodconnect>` mesmo após navegar
- **✅ Solução DEFINITIVA**: Usar terminal interativo separado
- **Método correto**:

  ```powershell
  # Método 1: Comando único com &&
  cd backend && npm run start:dev

  # Método 2: Terminal interativo
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd C:\Users\Jeremias Marinho\foodconnect\backend; npm run start:dev"

  # Método 3: Executar diretamente no contexto
  Invoke-Expression "cd .\backend\; npm run start:dev"
  ```

- **Nota CRÍTICA**: Este é um bug específico do terminal VSCode/PowerShell. Contexto não persiste entre comandos separados no mesmo terminal.

---

**🎯 Objetivo**: Manter consistência, qualidade e observabilidade durante desenvolvimento acelerado, priorizando bibliotecas consolidadas para maximizar eficiência em orçamento limitado de validação.
