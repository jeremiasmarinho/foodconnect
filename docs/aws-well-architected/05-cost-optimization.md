# Pilar 5: Cost Optimization (Otimização de Custos)

## 🎯 Princípios de Design

1. **Implementar Cloud Financial Management**
2. **Adotar um modelo de consumo**
3. **Medir eficiência geral**
4. **Parar de gastar dinheiro em trabalho indiferenciado**
5. **Analisar e atribuir despesas**

## 💰 Estimativa de Custos Mensais

### Ambiente de Produção

#### Compute (ECS Fargate)

```
3 tasks × 0.5 vCPU × $0.04048/hour × 730 hours = $88.75/month
3 tasks × 1 GB RAM × $0.004445/hour × 730 hours = $9.75/month

Total Compute: ~$99/month
```

#### Database (RDS PostgreSQL)

```
db.t3.medium (Multi-AZ)
- Instance: $0.136/hour × 730 hours × 2 (Multi-AZ) = $198.56/month
- Storage: 100 GB × $0.115/GB = $11.50/month
- Backup: 100 GB × $0.095/GB = $9.50/month

Total Database: ~$220/month
```

#### Cache (ElastiCache Redis)

```
cache.t3.micro
- Instance: $0.034/hour × 730 hours = $24.82/month

Total Cache: ~$25/month
```

#### Storage (S3)

```
- Standard Storage: 100 GB × $0.023/GB = $2.30/month
- Requests: 100,000 PUT × $0.005/1000 = $0.50/month
- Data Transfer: 50 GB × $0.09/GB = $4.50/month

Total Storage: ~$8/month
```

#### CDN (CloudFront)

```
- Data Transfer: 100 GB × $0.085/GB = $8.50/month
- Requests: 1M requests × $0.0075/10000 = $0.75/month

Total CDN: ~$10/month
```

#### Networking

```
- ALB: $0.0225/hour × 730 hours = $16.43/month
- NAT Gateway: $0.045/hour × 730 hours = $32.85/month
- Data Processing: $0.045/GB × 50 GB = $2.25/month

Total Networking: ~$52/month
```

#### Monitoring & Security

```
- CloudWatch: $10/month
- GuardDuty: $5/month
- Secrets Manager: $2/month

Total Monitoring: ~$17/month
```

### **CUSTO TOTAL ESTIMADO: ~$431/mês**

### Economia de Custos

#### 1. Reserved Instances

```
RDS Reserved Instance (1 year, no upfront):
- On-Demand: $220/month
- Reserved: $140/month
- Economia: $80/month (36%)
```

#### 2. Savings Plans

```
Compute Savings Plan (1 year, no upfront):
- On-Demand: $99/month
- Savings Plan: $66/month
- Economia: $33/month (33%)
```

#### 3. Spot Instances (Não-Crítico)

```
Usar Fargate Spot para tasks não-críticas:
- Economia: até 70%
```

### **CUSTO COM OTIMIZAÇÕES: ~$298/mês**

## 🏗️ Implementação de Cost Optimization

### 1. Right-Sizing

```typescript
// infrastructure/lib/cost-optimization/right-sizing.ts
import * as ce from "aws-sdk/clients/costexplorer";

export class CostOptimization {
  private costExplorer = new ce();

  async analyzeUnderutilizedResources() {
    const params = {
      TimePeriod: {
        Start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        End: new Date().toISOString().split("T")[0],
      },
      Granularity: "DAILY",
      Metrics: ["UnblendedCost", "UsageQuantity"],
      GroupBy: [
        {
          Type: "DIMENSION",
          Key: "SERVICE",
        },
      ],
    };

    const result = await this.costExplorer.getCostAndUsage(params).promise();
    return result;
  }
}
```

### 2. Auto-Scaling Agressivo

```typescript
// Scaling durante horários de baixo uso
const scaling = service.autoScaleTaskCount({
  minCapacity: 1, // Reduz para 1 task em horários calmos
  maxCapacity: 10,
});

// Schedule: Reduzir à noite
scaling.scaleOnSchedule("NightScaleDown", {
  schedule: appscaling.Schedule.cron({
    hour: "23",
    minute: "0",
  }),
  minCapacity: 1,
  maxCapacity: 3,
});

// Schedule: Aumentar de manhã
scaling.scaleOnSchedule("MorningScaleUp", {
  schedule: appscaling.Schedule.cron({
    hour: "7",
    minute: "0",
  }),
  minCapacity: 3,
  maxCapacity: 10,
});
```

### 3. S3 Lifecycle Policies

```typescript
// infrastructure/lib/cost-optimization/s3-lifecycle.ts
const bucket = new s3.Bucket(this, "ImagesBucket", {
  lifecycleRules: [
    {
      id: "TransitionToIA",
      enabled: true,
      transitions: [
        {
          // Mover para Infrequent Access após 30 dias
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30),
        },
        {
          // Mover para Glacier após 90 dias
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: cdk.Duration.days(90),
        },
      ],
    },
    {
      id: "DeleteOldVersions",
      enabled: true,
      noncurrentVersionExpiration: cdk.Duration.days(30),
    },
    {
      id: "DeleteIncompleteUploads",
      enabled: true,
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
    },
  ],
});
```

### 4. CloudWatch Logs Retention

```typescript
// Reduzir custos de armazenamento de logs
const logGroup = new logs.LogGroup(this, "ApplicationLogs", {
  logGroupName: "/foodconnect/application",
  retention: logs.RetentionDays.ONE_WEEK, // Ao invés de indefinido
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
```

### 5. Lambda para Tarefas Agendadas

```typescript
// Ao invés de manter ECS task rodando 24/7
// Use Lambda para tarefas agendadas (backups, reports, etc)

const cleanupFunction = new lambda.Function(this, "CleanupFunction", {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: "index.handler",
  code: lambda.Code.fromAsset("lambda/cleanup"),
  timeout: cdk.Duration.minutes(5),
  memorySize: 512,
});

// Schedule para rodar diariamente
new events.Rule(this, "CleanupSchedule", {
  schedule: events.Schedule.cron({
    hour: "2",
    minute: "0",
  }),
  targets: [new targets.LambdaFunction(cleanupFunction)],
});

// Custo: $0.0000002/request vs ECS task rodando 24/7
```

## 📊 Cost Monitoring

### AWS Cost Explorer API

```typescript
// backend/src/admin/cost-monitoring.service.ts
import { CostExplorer } from "aws-sdk";

@Injectable()
export class CostMonitoringService {
  private ce = new CostExplorer();

  async getDailyCosts(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params = {
      TimePeriod: {
        Start: startDate.toISOString().split("T")[0],
        End: endDate.toISOString().split("T")[0],
      },
      Granularity: "DAILY",
      Metrics: ["UnblendedCost"],
      GroupBy: [
        {
          Type: "DIMENSION",
          Key: "SERVICE",
        },
      ],
    };

    return this.ce.getCostAndUsage(params).promise();
  }

  async getForecast(days: number = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const params = {
      TimePeriod: {
        Start: startDate.toISOString().split("T")[0],
        End: endDate.toISOString().split("T")[0],
      },
      Metric: "UNBLENDED_COST",
      Granularity: "MONTHLY",
    };

    return this.ce.getCostForecast(params).promise();
  }
}
```

### Budget Alerts

```typescript
// infrastructure/lib/cost-optimization/budgets.ts
import * as budgets from "aws-cdk-lib/aws-budgets";

const monthlyBudget = new budgets.CfnBudget(this, "MonthlyBudget", {
  budget: {
    budgetName: "FoodConnect-Monthly-Budget",
    budgetType: "COST",
    timeUnit: "MONTHLY",
    budgetLimit: {
      amount: 500, // $500/month
      unit: "USD",
    },
  },
  notificationsWithSubscribers: [
    {
      notification: {
        notificationType: "ACTUAL",
        comparisonOperator: "GREATER_THAN",
        threshold: 80, // Alert at 80%
        thresholdType: "PERCENTAGE",
      },
      subscribers: [
        {
          subscriptionType: "EMAIL",
          address: "devops@foodconnect.com",
        },
      ],
    },
    {
      notification: {
        notificationType: "FORECASTED",
        comparisonOperator: "GREATER_THAN",
        threshold: 100, // Alert if forecast exceeds budget
        thresholdType: "PERCENTAGE",
      },
      subscribers: [
        {
          subscriptionType: "EMAIL",
          address: "devops@foodconnect.com",
        },
      ],
    },
  ],
});
```

## 📈 Cost Allocation Tags

```typescript
// Adicionar tags em todos os recursos
cdk.Tags.of(this).add("Project", "FoodConnect");
cdk.Tags.of(this).add("Environment", "Production");
cdk.Tags.of(this).add("Team", "Backend");
cdk.Tags.of(this).add("CostCenter", "Engineering");

// Isso permite análise detalhada de custos por:
// - Projeto
// - Ambiente (Dev/Staging/Prod)
// - Time
// - Centro de custo
```

## ✅ Cost Optimization Checklist

- [ ] Right-size recursos baseado em uso real
- [ ] Comprar Reserved Instances para workloads previsíveis
- [ ] Usar Savings Plans para compute
- [ ] Implementar auto-scaling agressivo
- [ ] S3 lifecycle policies configuradas
- [ ] CloudWatch logs com retention adequada
- [ ] Lambda para tarefas agendadas
- [ ] Budget alerts configurados
- [ ] Cost allocation tags em todos recursos
- [ ] Review mensal de custos
- [ ] Deletar recursos não utilizados
- [ ] Usar spot instances onde possível

## 🎓 Recursos

- [AWS Cost Optimization](https://aws.amazon.com/pricing/cost-optimization/)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)
- [AWS Budgets](https://aws.amazon.com/aws-cost-management/aws-budgets/)
