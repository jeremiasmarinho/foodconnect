# Pilar 4: Performance Efficiency (Eficiência de Performance)

## 🎯 Princípios de Design

1. **Democratizar tecnologias avançadas**
2. **Ir global em minutos**
3. **Usar arquiteturas serverless**
4. **Experimentar mais frequentemente**
5. **Considerar afinidade mecânica**

## 🏗️ Implementação no FoodConnect

### 1. Caching Strategy

#### Redis para Cache Distribuído

```typescript
// backend/src/cache/cache.service.ts
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  // Cache de posts do feed
  async getFeed(userId: string, page: number): Promise<any[] | null> {
    const key = `feed:${userId}:${page}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setFeed(userId: string, page: number, data: any[], ttl = 300) {
    const key = `feed:${userId}:${page}`;
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  // Cache de perfil de usuário
  async getUserProfile(userId: string): Promise<any | null> {
    const key = `user:${userId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Invalidação de cache
  async invalidateUserCache(userId: string) {
    const pattern = `user:${userId}*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

#### CloudFront para CDN

```typescript
// infrastructure/lib/performance/cloudfront.ts
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

const distribution = new cloudfront.Distribution(this, "Distribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(websiteBucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: new cloudfront.CachePolicy(this, "CachePolicy", {
      cachePolicyName: "FoodConnectCachePolicy",
      // Cache por 1 dia
      defaultTtl: cdk.Duration.days(1),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.days(365),
      // Cache keys
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        "Authorization",
        "CloudFront-Viewer-Country"
      ),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    }),
    // Compressão automática
    compress: true,
  },
  // Cache behavior para imagens
  additionalBehaviors: {
    "/images/*": {
      origin: new origins.S3Origin(imagesBucket),
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      compress: true,
    },
    "/api/*": {
      origin: new origins.HttpOrigin(albDnsName),
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
    },
  },
  // Edge locations
  priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Europe, Israel
});
```

### 2. Database Optimization

#### Read Replicas

```typescript
const readReplica = new rds.DatabaseInstanceReadReplica(this, "ReadReplica", {
  sourceDatabaseInstance: primaryDatabase,
  instanceType: ec2.InstanceType.of(
    ec2.InstanceClass.T3,
    ec2.InstanceSize.MEDIUM
  ),
  vpc,
  publiclyAccessible: false,
});

// Uso no código
// backend/src/posts/posts.service.ts
@Injectable()
export class PostsService {
  constructor(
    @InjectPrisma("primary") private primaryDb: PrismaClient,
    @InjectPrisma("replica") private replicaDb: PrismaClient
  ) {}

  // Writes vão para primary
  async createPost(data: CreatePostDto) {
    return this.primaryDb.post.create({ data });
  }

  // Reads vão para replica
  async getPosts(page: number) {
    return this.replicaDb.post.findMany({
      skip: (page - 1) * 10,
      take: 10,
    });
  }
}
```

#### Connection Pooling

```typescript
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  pool_timeout = 30
  connection_limit = 20
}

// backend/src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Connection pool monitoring
    this.$on('query', (e) => {
      if (e.duration > 1000) {
        console.warn(`Slow query detected: ${e.duration}ms`, e.query);
      }
    });
  }
}
```

### 3. Image Optimization

```typescript
// backend/src/upload/image-optimizer.service.ts
import * as sharp from "sharp";
import { S3 } from "aws-sdk";

@Injectable()
export class ImageOptimizerService {
  private s3 = new S3();

  async optimizeAndUpload(file: Express.Multer.File): Promise<string> {
    const optimized = await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload original
    const originalKey = `images/original/${Date.now()}-${file.originalname}`;
    await this.s3
      .putObject({
        Bucket: "foodconnect-images",
        Key: originalKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    // Upload optimized
    const optimizedKey = `images/optimized/${Date.now()}.webp`;
    await this.s3
      .putObject({
        Bucket: "foodconnect-images",
        Key: optimizedKey,
        Body: optimized,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000", // 1 year
      })
      .promise();

    // Generate thumbnail
    const thumbnail = await sharp(file.buffer)
      .resize(300, 300, { fit: "cover" })
      .webp({ quality: 70 })
      .toBuffer();

    const thumbnailKey = `images/thumbnails/${Date.now()}.webp`;
    await this.s3
      .putObject({
        Bucket: "foodconnect-images",
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000",
      })
      .promise();

    return `https://cdn.foodconnect.com/${optimizedKey}`;
  }
}
```

### 4. API Performance

#### Pagination

```typescript
// backend/src/common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

// Uso
@Get()
async getPosts(@Query() pagination: PaginationDto) {
  return this.postsService.findAll({
    skip: pagination.skip,
    take: pagination.limit,
  });
}
```

#### Lazy Loading & Eager Loading

```typescript
// Lazy loading - só carrega o necessário
const posts = await prisma.post.findMany({
  select: {
    id: true,
    content: true,
    imageUrls: true,
    // NÃO carrega comments, likes, etc
  },
});

// Eager loading - carrega relacionamentos
const posts = await prisma.post.findMany({
  include: {
    user: true,
    establishment: true,
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  },
});
```

### 5. Monitoramento de Performance

```typescript
// backend/src/common/interceptors/performance.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;

        // Log slow requests
        if (duration > 1000) {
          console.warn(`Slow request: ${method} ${url} took ${duration}ms`);
        }

        // Send metrics to CloudWatch
        this.metrics.recordAPILatency(url, duration);
      })
    );
  }
}
```

## 📊 Performance Targets

```typescript
const performanceTargets = {
  api: {
    p50Latency: "<100ms",
    p95Latency: "<500ms",
    p99Latency: "<1000ms",
  },
  database: {
    queryTime: "<50ms",
    connectionPoolUtilization: "<70%",
  },
  cache: {
    hitRate: ">90%",
    ttl: "5 minutes",
  },
  cdn: {
    cacheHitRatio: ">85%",
    edgeLatency: "<50ms",
  },
  images: {
    maxSize: "500KB",
    format: "WebP",
    compressionQuality: 80,
  },
};
```

## ✅ Performance Checklist

- [ ] Redis cache implementado
- [ ] CloudFront CDN configurado
- [ ] Read replicas para database
- [ ] Connection pooling otimizado
- [ ] Image optimization (WebP, thumbnails)
- [ ] Pagination em todas as listas
- [ ] Lazy loading implementado
- [ ] Performance monitoring
- [ ] Slow query detection
- [ ] X-Ray tracing habilitado

## 🎓 Recursos

- [AWS Performance Efficiency Pillar](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/)
