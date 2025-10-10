# Pilar 3: Reliability (Confiabilidade)

## 🎯 Princípios de Design

1. **Recuperar-se automaticamente de falhas**
2. **Testar procedimentos de recuperação**
3. **Escalar horizontalmente para aumentar disponibilidade**
4. **Parar de adivinhar capacidade**
5. **Gerenciar mudanças através de automação**

## 🏗️ Implementação no FoodConnect

### 1. Multi-AZ Deployment

#### RDS Multi-AZ

```typescript
// infrastructure/lib/reliability/database.ts
const database = new rds.DatabaseInstance(this, "FoodConnectDB", {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15,
  }),
  vpc,
  multiAz: true, // Replica síncrona em outra AZ
  backupRetention: cdk.Duration.days(7),
  deleteAutomatedBackups: false,
  // Automated backups
  preferredBackupWindow: "03:00-04:00",
  preferredMaintenanceWindow: "sun:04:00-sun:05:00",
});
```

#### ECS Multi-AZ

```typescript
// infrastructure/lib/reliability/ecs-service.ts
const service = new ecs.FargateService(this, "BackendService", {
  cluster,
  taskDefinition,
  desiredCount: 3, // Mínimo de 3 tasks
  minHealthyPercent: 100, // Sempre manter 100% durante deploys
  maxHealthyPercent: 200, // Pode ter até 200% durante deploys
  // Distribuir entre múltiplas AZs
  vpcSubnets: {
    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
  },
  // Health checks
  healthCheckGracePeriod: cdk.Duration.seconds(60),
});
```

### 2. Auto Scaling

#### Application Auto Scaling

```typescript
// infrastructure/lib/reliability/auto-scaling.ts
const scaling = service.autoScaleTaskCount({
  minCapacity: 3,
  maxCapacity: 10,
});

// CPU-based scaling
scaling.scaleOnCpuUtilization("CpuScaling", {
  targetUtilizationPercent: 70,
  scaleInCooldown: cdk.Duration.seconds(60),
  scaleOutCooldown: cdk.Duration.seconds(60),
});

// Memory-based scaling
scaling.scaleOnMemoryUtilization("MemoryScaling", {
  targetUtilizationPercent: 80,
});

// Request count scaling
scaling.scaleOnRequestCount("RequestScaling", {
  requestsPerTarget: 1000,
  targetGroup: targetGroup,
});

// Schedule-based scaling (horários de pico)
scaling.scaleOnSchedule("MorningPeak", {
  schedule: appscaling.Schedule.cron({
    hour: "11",
    minute: "0",
  }),
  minCapacity: 5,
  maxCapacity: 15,
});

scaling.scaleOnSchedule("EveningPeak", {
  schedule: appscaling.Schedule.cron({
    hour: "18",
    minute: "0",
  }),
  minCapacity: 5,
  maxCapacity: 15,
});
```

### 3. Health Checks

#### ALB Health Checks

```typescript
const targetGroup = new elbv2.ApplicationTargetGroup(this, "TargetGroup", {
  vpc,
  port: 3000,
  protocol: elbv2.ApplicationProtocol.HTTP,
  targetType: elbv2.TargetType.IP,
  // Health check configuration
  healthCheck: {
    path: "/health",
    interval: cdk.Duration.seconds(30),
    timeout: cdk.Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 3,
    healthyHttpCodes: "200",
  },
  // Deregistration delay
  deregistrationDelay: cdk.Duration.seconds(30),
});
```

#### Application Health Endpoint

```typescript
// backend/src/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { PrismaHealthIndicator } from "./prisma.health";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck("database"),
      // Redis health
      () => this.cache.pingCheck("redis"),
      // Disk space
      () =>
        this.disk.checkStorage("storage", {
          path: "/",
          thresholdPercent: 0.9,
        }),
      // Memory
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
    ]);
  }
}
```

### 4. Backup e Recovery

#### Automated Backups

```typescript
// infrastructure/lib/reliability/backup.ts
import * as backup from "aws-cdk-lib/aws-backup";

export class BackupStack extends cdk.Stack {
  createBackupPlan() {
    const vault = new backup.BackupVault(this, "BackupVault", {
      backupVaultName: "foodconnect-backup-vault",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const plan = new backup.BackupPlan(this, "BackupPlan", {
      backupVault: vault,
      backupPlanRules: [
        // Daily backups
        new backup.BackupPlanRule({
          ruleName: "DailyBackup",
          scheduleExpression: backup.Schedule.cron({
            hour: "3",
            minute: "0",
          }),
          deleteAfter: cdk.Duration.days(7),
        }),
        // Weekly backups
        new backup.BackupPlanRule({
          ruleName: "WeeklyBackup",
          scheduleExpression: backup.Schedule.cron({
            weekDay: "SUN",
            hour: "3",
            minute: "0",
          }),
          deleteAfter: cdk.Duration.days(30),
        }),
        // Monthly backups
        new backup.BackupPlanRule({
          ruleName: "MonthlyBackup",
          scheduleExpression: backup.Schedule.cron({
            day: "1",
            hour: "3",
            minute: "0",
          }),
          deleteAfter: cdk.Duration.days(365),
        }),
      ],
    });

    // Add resources to backup
    plan.addSelection("BackupSelection", {
      resources: [backup.BackupResource.fromRdsDatabaseInstance(database)],
    });

    return { vault, plan };
  }
}
```

#### Point-in-Time Recovery

```typescript
// RDS já suporta PITR automaticamente
const database = new rds.DatabaseInstance(this, "Database", {
  // ...
  backupRetention: cdk.Duration.days(7),
  // Habilita PITR
  enablePerformanceInsights: true,
});
```

### 5. Disaster Recovery

#### Cross-Region Replication

```typescript
// infrastructure/lib/reliability/disaster-recovery.ts
export class DisasterRecoveryStack extends cdk.Stack {
  setupCrossRegionBackup() {
    // S3 Cross-Region Replication
    const primaryBucket = new s3.Bucket(this, "PrimaryBucket", {
      versioned: true,
      replicationConfiguration: {
        role: replicationRole,
        rules: [
          {
            id: "ReplicateToSecondaryRegion",
            status: "Enabled",
            destination: {
              bucket: secondaryBucket.bucketArn,
              replicationTime: {
                status: "Enabled",
                time: { minutes: 15 },
              },
            },
          },
        ],
      },
    });

    // RDS Read Replica em outra região
    const readReplica = new rds.DatabaseInstanceReadReplica(
      this,
      "ReadReplica",
      {
        sourceDatabaseInstance: primaryDatabase,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.LARGE
        ),
        vpc: secondaryVpc,
      }
    );
  }
}
```

#### DR Runbook

```markdown
# Disaster Recovery Runbook

## RTO (Recovery Time Objective): 1 hora

## RPO (Recovery Point Objective): 15 minutos

### Cenário 1: Region Failure

1. **Detecção** (0-5 min)

   - CloudWatch Alarm: Region Health Check Failed
   - PagerDuty alert to on-call team

2. **Validação** (5-10 min)

   - Confirm region is down
   - Check AWS Service Health Dashboard
   - Assess impact

3. **Failover** (10-30 min)

   - Promote RDS read replica to primary
   - Update Route53 to point to secondary region
   - Scale up ECS tasks in secondary region
   - Verify application functionality

4. **Communication** (Throughout)

   - Update status page
   - Notify stakeholders
   - Document timeline

5. **Monitoring** (30-60 min)
   - Monitor application metrics
   - Verify data consistency
   - Test critical workflows

### Cenário 2: Database Failure

1. **Automated Failover** (0-2 min)

   - RDS Multi-AZ failover automatically

2. **Validation** (2-5 min)

   - Verify database is accessible
   - Check application health

3. **If Automated Failover Fails** (5-30 min)
   - Restore from latest automated backup
   - Or restore to point-in-time
   - Update connection strings if needed
```

### 6. Circuit Breaker Pattern

```typescript
// backend/src/common/circuit-breaker/circuit-breaker.ts
import { Injectable } from "@nestjs/common";

enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

@Injectable()
export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime.getTime() > this.timeout
    );
  }
}
```

### 7. Retry Logic com Exponential Backoff

```typescript
// backend/src/common/retry/retry.decorator.ts
export function Retry(options: {
  maxAttempts: number;
  backoff: "exponential" | "linear";
  initialDelay?: number;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      let delay = options.initialDelay || 100;

      for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          if (attempt < options.maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delay));

            if (options.backoff === "exponential") {
              delay *= 2;
            } else {
              delay += options.initialDelay || 100;
            }
          }
        }
      }

      throw lastError!;
    };

    return descriptor;
  };
}

// Uso:
@Injectable()
export class ExternalApiService {
  @Retry({ maxAttempts: 3, backoff: "exponential", initialDelay: 1000 })
  async fetchData(url: string): Promise<any> {
    return await axios.get(url);
  }
}
```

## 📊 Métricas de Confiabilidade

### SLA Targets

```typescript
const reliabilityMetrics = {
  availability: {
    target: "99.9%", // ~43 minutes downtime/month
    current: "99.95%",
  },
  errorRate: {
    target: "<0.1%",
    current: "0.05%",
  },
  mttr: {
    target: "<30 minutes",
    current: "22 minutes",
  },
  mtbf: {
    target: ">720 hours",
    current: "840 hours",
  },
  rto: {
    target: "1 hour",
  },
  rpo: {
    target: "15 minutes",
  },
};
```

## ✅ Reliability Checklist

- [ ] Multi-AZ deployment para todos os componentes críticos
- [ ] Auto scaling configurado (CPU, Memory, Request count)
- [ ] Health checks implementados
- [ ] Backups automáticos configurados (daily, weekly, monthly)
- [ ] Point-in-time recovery habilitado
- [ ] Cross-region replication para DR
- [ ] Circuit breaker implementado
- [ ] Retry logic com exponential backoff
- [ ] Chaos engineering tests
- [ ] DR runbooks documentados
- [ ] DR drills agendados (quarterly)

## 🎓 Recursos

- [AWS Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/)
- [Chaos Engineering](https://principlesofchaos.org/)
- [Site Reliability Engineering](https://sre.google/books/)
