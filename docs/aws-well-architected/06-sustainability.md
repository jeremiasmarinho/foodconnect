# Pilar 6: Sustainability (Sustentabilidade)

## 🎯 Princípios de Design

1. **Entender seu impacto**
2. **Estabelecer objetivos de sustentabilidade**
3. **Maximizar utilização**
4. **Antecipar e adotar ofertas de hardware e software mais eficientes**
5. **Usar serviços gerenciados**
6. **Reduzir impacto downstream de suas cargas de trabalho cloud**

## 🌱 Implementação no FoodConnect

### 1. Compute Efficiency

#### Usar Graviton (ARM) Processors

```typescript
// 20% mais eficiente energeticamente e até 40% melhor custo-benefício
const service = new ecs.FargateService(this, "BackendService", {
  cluster,
  taskDefinition,
  // Usar ARM64 (Graviton)
  runtimePlatform: {
    cpuArchitecture: ecs.CpuArchitecture.ARM64,
    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
  },
});

// RDS também suporta Graviton
const database = new rds.DatabaseInstance(this, "Database", {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15,
  }),
  // Graviton-based instance
  instanceType: ec2.InstanceType.of(
    ec2.InstanceClass.T4G, // "G" = Graviton
    ec2.InstanceSize.MEDIUM
  ),
});
```

### 2. Right-Sizing e Auto-Scaling

```typescript
// Dimensionar recursos para necessidade real
const scaling = service.autoScaleTaskCount({
  minCapacity: 1, // Mínimo necessário
  maxCapacity: 10,
});

// Target tracking scaling - ajusta automaticamente
scaling.scaleOnCpuUtilization("CpuScaling", {
  targetUtilizationPercent: 70, // Mantém 70% utilização
});

// Isso evita:
// - Over-provisioning (desperdício)
// - Under-utilization (ineficiência)
```

### 3. Serverless First

```typescript
// Lambda para tarefas esporádicas (mais sustentável que EC2/ECS 24/7)
const imageProcessor = new lambda.Function(this, "ImageProcessor", {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: "index.handler",
  code: lambda.Code.fromAsset("lambda/image-processor"),
  // ARM64 é mais eficiente
  architecture: lambda.Architecture.ARM_64,
  // Right-size memory
  memorySize: 512,
  timeout: cdk.Duration.seconds(30),
});

// API Gateway REST API para endpoints leves
const api = new apigateway.RestApi(this, "PublicAPI", {
  restApiName: "FoodConnect Public API",
  // Cache responses
  deployOptions: {
    cachingEnabled: true,
    cacheClusterEnabled: true,
    cacheTtl: cdk.Duration.minutes(5),
  },
});
```

### 4. Data Transfer Optimization

```typescript
// Reduzir transferência de dados = menos carbono

// 1. Comprimir responses
app.use(compression({
  threshold: 0, // Comprimir tudo
  level: 6, // Nível de compressão (1-9)
}));

// 2. Usar CloudFront para cache próximo ao usuário
const distribution = new cloudfront.Distribution(this, 'CDN', {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket),
    compress: true, // Compressão automática
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
  },
  // Edge locations mais próximas
  priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
});

// 3. Otimizar imagens
async optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, { fit: 'inside' })
    .webp({ quality: 80 }) // WebP é mais eficiente
    .toBuffer();
}
```

### 5. Database Optimization

```typescript
// Query optimization - menos queries = menos energia

// ❌ N+1 queries (ineficiente)
const posts = await prisma.post.findMany();
for (const post of posts) {
  const user = await prisma.user.findUnique({ where: { id: post.userId } });
}

// ✅ Single query com include (eficiente)
const posts = await prisma.post.findMany({
  include: { user: true },
});

// Connection pooling - reutilizar conexões
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 20 // Limitar conexões simultâneas
}
```

### 6. S3 Intelligent-Tiering

```typescript
// Mover automaticamente para tier mais eficiente
const bucket = new s3.Bucket(this, "ImagesBucket", {
  intelligentTieringConfigurations: [
    {
      name: "ArchiveAfter90Days",
      archiveAccessTierTime: cdk.Duration.days(90),
      deepArchiveAccessTierTime: cdk.Duration.days(180),
    },
  ],
  lifecycleRules: [
    {
      id: "DeleteOldBackups",
      enabled: true,
      expiration: cdk.Duration.days(365),
      transitions: [
        {
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: cdk.Duration.days(90),
        },
      ],
    },
  ],
});
```

### 7. Monitoramento de Carbono

```typescript
// backend/src/admin/carbon-footprint.service.ts
import { CloudWatch } from "aws-sdk";

@Injectable()
export class CarbonFootprintService {
  private cloudwatch = new CloudWatch();

  async calculateCarbonFootprint() {
    // AWS Customer Carbon Footprint Tool fornece dados
    // Aqui calculamos estimativa baseada em uso

    const metrics = await this.getUsageMetrics();

    // Estimativa simplificada:
    // 1 vCPU hour ≈ 0.000023 metric tons CO2e
    const cpuCarbonFootprint = metrics.cpuHours * 0.000023;

    // 1 GB storage month ≈ 0.000002 metric tons CO2e
    const storageCarbonFootprint = metrics.storageGB * 0.000002;

    // 1 GB data transfer ≈ 0.000001 metric tons CO2e
    const transferCarbonFootprint = metrics.transferGB * 0.000001;

    return {
      totalCO2e:
        cpuCarbonFootprint + storageCarbonFootprint + transferCarbonFootprint,
      breakdown: {
        compute: cpuCarbonFootprint,
        storage: storageCarbonFootprint,
        transfer: transferCarbonFootprint,
      },
      metrics,
    };
  }

  private async getUsageMetrics() {
    // Obter métricas do CloudWatch
    const cpuHours = await this.getCPUHours();
    const storageGB = await this.getStorageGB();
    const transferGB = await this.getTransferGB();

    return { cpuHours, storageGB, transferGB };
  }
}
```

### 8. Green Regions

```typescript
// Usar regiões AWS com energia mais limpa
// Fonte: https://sustainability.aboutamazon.com/

const greenRegions = {
  "us-west-2": { renewable: "95%", location: "Oregon" },
  "eu-central-1": { renewable: "80%", location: "Frankfurt" },
  "eu-west-1": { renewable: "89%", location: "Ireland" },
  "ca-central-1": { renewable: "100%", location: "Montreal" },
  "ap-southeast-2": { renewable: "96%", location: "Sydney" },
};

// Escolher região baseado em:
// 1. Proximidade aos usuários (latência)
// 2. % de energia renovável
// 3. Custos

const app = new cdk.App();
new FoodConnectStack(app, "FoodConnectStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-west-2", // 95% renewable energy
  },
});
```

## 📊 Sustainability Metrics

```typescript
const sustainabilityMetrics = {
  compute: {
    architecture: "ARM64 (Graviton)",
    energyEfficiency: "+20% vs x86",
    utilizationTarget: "70%",
    currentUtilization: "68%",
  },
  storage: {
    intelligentTiering: "Enabled",
    dataReduction: "35%", // Compression + deduplication
    unusedDataCleanup: "Automated",
  },
  network: {
    compressionEnabled: true,
    cdnCacheHitRate: "87%",
    edgeLocations: "Optimized for user proximity",
  },
  region: {
    primaryRegion: "us-west-2",
    renewableEnergy: "95%",
  },
  carbonFootprint: {
    monthlyCO2e: "0.42 metric tons",
    trend: "-15% vs last month",
  },
};
```

## 🌍 Best Practices

### 1. Code Efficiency

```typescript
// Use efficient algorithms
// O(n log n) é melhor que O(n²)

// ❌ Inefficient
function findDuplicates(arr: number[]): number[] {
  const duplicates: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

// ✅ Efficient
function findDuplicates(arr: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const num of arr) {
    if (seen.has(num)) {
      duplicates.add(num);
    }
    seen.add(num);
  }

  return Array.from(duplicates);
}
```

### 2. Cache Aggressively

```typescript
// Menos requests = menos processamento = menos energia

@Injectable()
export class PostsService {
  @Cacheable({ ttl: 300 }) // 5 minutes cache
  async getFeed(userId: string): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { userId },
    });
  }
}
```

### 3. Batch Processing

```typescript
// Processar em lotes é mais eficiente

// ❌ Individual processing
for (const image of images) {
  await processImage(image);
}

// ✅ Batch processing
await Promise.all(images.map((image) => processImage(image)));
```

### 4. Delete Unused Resources

```typescript
// Script para limpar recursos não utilizados
async function cleanupUnusedResources() {
  // Delete old logs
  await deleteLogsOlderThan(90);

  // Delete orphaned images
  await deleteOrphanedImages();

  // Delete old backups
  await deleteBackupsOlderThan(365);

  // Delete inactive user data (GDPR compliant)
  await deleteInactiveUserData(730);
}

// Schedule cleanup
new events.Rule(this, "WeeklyCleanup", {
  schedule: events.Schedule.weekly(),
  targets: [new targets.LambdaFunction(cleanupFunction)],
});
```

## ✅ Sustainability Checklist

- [ ] Usar Graviton (ARM64) para compute
- [ ] Implementar auto-scaling eficiente
- [ ] Usar serverless onde possível
- [ ] Habilitar compressão em todas as respostas
- [ ] Otimizar imagens (WebP, thumbnails)
- [ ] Implementar cache agressivo
- [ ] Usar S3 Intelligent-Tiering
- [ ] Deletar dados não utilizados
- [ ] Escolher região com energia renovável
- [ ] Monitorar carbon footprint
- [ ] Otimizar queries de database
- [ ] Implementar connection pooling
- [ ] Usar CloudFront para reduzir transfer
- [ ] Revisar e otimizar código regularmente

## 🎓 Recursos

- [AWS Sustainability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/)
- [AWS Customer Carbon Footprint Tool](https://aws.amazon.com/aws-cost-management/aws-customer-carbon-footprint-tool/)
- [Sustainable Software Engineering](https://principles.green/)
- [Green Software Foundation](https://greensoftware.foundation/)
