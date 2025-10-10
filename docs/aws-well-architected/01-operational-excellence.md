# Pilar 1: Operational Excellence (Excelência Operacional)

## 🎯 Princípios de Design

1. **Realizar operações como código** - Infrastructure as Code (IaC)
2. **Fazer mudanças frequentes, pequenas e reversíveis**
3. **Refinar procedimentos operacionais frequentemente**
4. **Antecipar falhas** - Chaos engineering
5. **Aprender com todas as falhas operacionais**

## 🏗️ Implementação no FoodConnect

### 1. Infrastructure as Code (IaC)

#### AWS CDK (Cloud Development Kit)

```typescript
// infrastructure/lib/foodconnect-stack.ts
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as rds from "aws-cdk-lib/aws-rds";

export class FoodConnectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, "FoodConnectVPC", {
      maxAzs: 3,
      natGateways: 1,
    });

    // RDS PostgreSQL
    const database = new rds.DatabaseInstance(this, "FoodConnectDB", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      multiAz: true,
      allocatedStorage: 100,
      maxAllocatedStorage: 200,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: true,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, "FoodConnectCluster", {
      vpc,
      containerInsights: true,
    });
  }
}
```

### 2. Monitoramento e Observabilidade

#### CloudWatch Logs

```typescript
// backend/src/common/logger/cloudwatch.logger.ts
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import * as CloudWatchTransport from "winston-cloudwatch";

export const cloudWatchLogger = WinstonModule.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: "/foodconnect/backend",
      logStreamName: `${process.env.NODE_ENV}-${new Date().toISOString()}`,
      awsRegion: process.env.AWS_REGION,
      messageFormatter: ({ level, message, ...meta }) => {
        return JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          message,
          ...meta,
        });
      },
    }),
  ],
});
```

#### Métricas Customizadas

```typescript
// backend/src/common/metrics/cloudwatch.metrics.ts
import { CloudWatch } from "aws-sdk";

export class MetricsService {
  private cloudwatch = new CloudWatch();

  async recordMetric(
    metricName: string,
    value: number,
    unit: string = "Count"
  ) {
    await this.cloudwatch
      .putMetricData({
        Namespace: "FoodConnect",
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
          },
        ],
      })
      .promise();
  }

  async recordPostCreation() {
    await this.recordMetric("PostsCreated", 1);
  }

  async recordUserLogin() {
    await this.recordMetric("UserLogins", 1);
  }

  async recordAPILatency(endpoint: string, latency: number) {
    await this.recordMetric(`API_Latency_${endpoint}`, latency, "Milliseconds");
  }
}
```

### 3. Runbooks e Playbooks

#### Estrutura de Documentação

```
docs/
├── runbooks/
│   ├── incident-response.md
│   ├── database-recovery.md
│   ├── service-degradation.md
│   └── rollback-deployment.md
├── playbooks/
│   ├── scaling-events.md
│   ├── security-incident.md
│   └── data-migration.md
└── sop/
    ├── deployment.md
    ├── monitoring.md
    └── backup-restore.md
```

#### Exemplo: Runbook de Incident Response

```markdown
# Runbook: Incident Response

## Severidade: P1 - Critical

### Detecção

- CloudWatch Alarm: High Error Rate
- X-Ray: Increased Latency
- SNS: Alert to on-call team

### Passos de Resposta

1. **Acknowledge** (0-5 min)

   - Acknowledge alarm in PagerDuty
   - Join incident Slack channel
   - Assign incident commander

2. **Investigate** (5-15 min)

   - Check CloudWatch Dashboard
   - Review recent deployments
   - Check X-Ray traces
   - Query logs in CloudWatch Insights

3. **Mitigate** (15-30 min)

   - If deployment: Rollback via GitHub Actions
   - If database: Switch to read replica
   - If scaling: Manually adjust ECS tasks

4. **Communicate** (Throughout)

   - Update status page
   - Notify stakeholders
   - Document timeline

5. **Resolve** (30+ min)
   - Verify metrics normalized
   - Close incident
   - Schedule post-mortem
```

### 4. CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Backend Tests
        run: |
          cd backend
          npm ci
          npm run test
          npm run test:e2e

      - name: Run Frontend Tests
        run: |
          cd frontend
          npm ci
          npm run test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and Push Backend Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/foodconnect-backend:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/foodconnect-backend:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster foodconnect-cluster \
            --service foodconnect-backend \
            --force-new-deployment

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Deploy to S3
        run: |
          aws s3 sync frontend/build s3://foodconnect-frontend --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### 5. Automated Rollback

```typescript
// scripts/automated-rollback.ts
import { ECS, CloudWatch } from "aws-sdk";

const ecs = new ECS();
const cloudwatch = new CloudWatch();

async function checkHealthMetrics(serviceName: string): Promise<boolean> {
  const params = {
    MetricDataQueries: [
      {
        Id: "errorRate",
        MetricStat: {
          Metric: {
            Namespace: "FoodConnect",
            MetricName: "ErrorRate",
            Dimensions: [{ Name: "Service", Value: serviceName }],
          },
          Period: 300,
          Stat: "Average",
        },
      },
    ],
    StartTime: new Date(Date.now() - 5 * 60 * 1000),
    EndTime: new Date(),
  };

  const result = await cloudwatch.getMetricData(params).promise();
  const errorRate = result.MetricDataResults?.[0]?.Values?.[0] || 0;

  // If error rate > 5%, trigger rollback
  return errorRate < 5;
}

async function rollback(serviceName: string, previousTaskDef: string) {
  console.log(`Rolling back ${serviceName} to ${previousTaskDef}`);

  await ecs
    .updateService({
      cluster: "foodconnect-cluster",
      service: serviceName,
      taskDefinition: previousTaskDef,
      forceNewDeployment: true,
    })
    .promise();
}

// Run health check every 5 minutes after deployment
setInterval(async () => {
  const isHealthy = await checkHealthMetrics("foodconnect-backend");

  if (!isHealthy) {
    await rollback("foodconnect-backend", process.env.PREVIOUS_TASK_DEF!);
    process.exit(1);
  }
}, 5 * 60 * 1000);
```

## 📊 KPIs e Métricas

### Deployment Metrics

- **Deployment Frequency**: Target > 10/week
- **Lead Time for Changes**: Target < 1 hour
- **Mean Time to Recovery (MTTR)**: Target < 30 minutes
- **Change Failure Rate**: Target < 5%

### Operational Metrics

```typescript
// Dashboard de Métricas Operacionais
const operationalMetrics = {
  deployment: {
    frequency: "15/week",
    successRate: "98%",
    averageDuration: "12 minutes",
  },
  incidents: {
    mttr: "22 minutes",
    p1Incidents: "0/month",
    p2Incidents: "2/month",
  },
  automation: {
    deploymentAutomation: "100%",
    testCoverage: "85%",
    infrastructureAsCode: "100%",
  },
};
```

## 🔧 Ferramentas

### 1. Observabilidade

- **CloudWatch**: Logs, Metrics, Alarms
- **X-Ray**: Distributed Tracing
- **CloudWatch Insights**: Log Analytics

### 2. Incident Management

- **PagerDuty**: On-call rotation e alertas
- **Slack**: Comunicação de incidentes
- **Status Page**: Transparência para usuários

### 3. Automation

- **GitHub Actions**: CI/CD
- **AWS CDK**: Infrastructure as Code
- **Terraform**: Alternative IaC

### 4. Testing

- **Jest**: Unit tests
- **Supertest**: E2E tests
- **k6**: Load testing
- **Chaos Toolkit**: Chaos engineering

## 📝 Checklist de Implementação

- [ ] Setup CloudWatch Logs para todos os serviços
- [ ] Criar dashboards de métricas operacionais
- [ ] Configurar alarmes críticos (error rate, latency)
- [ ] Implementar distributed tracing com X-Ray
- [ ] Criar runbooks para cenários comuns
- [ ] Setup CI/CD pipeline completo
- [ ] Implementar automated rollback
- [ ] Configurar incident management (PagerDuty)
- [ ] Criar status page pública
- [ ] Documentar todos os procedimentos operacionais
- [ ] Treinar equipe em runbooks
- [ ] Realizar game days de incident response

## 🎓 Recursos de Aprendizado

- [AWS Well-Architected Operational Excellence](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html)
- [Site Reliability Engineering (SRE) Book](https://sre.google/books/)
- [AWS DevOps Blog](https://aws.amazon.com/blogs/devops/)
