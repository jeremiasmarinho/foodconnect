# Pilar 2: Security (Segurança)

## 🎯 Princípios de Design

1. **Implementar uma base de identidade forte**
2. **Habilitar rastreabilidade**
3. **Aplicar segurança em todas as camadas**
4. **Automatizar melhores práticas de segurança**
5. **Proteger dados em trânsito e em repouso**
6. **Manter pessoas longe dos dados**
7. **Preparar-se para eventos de segurança**

## 🏗️ Implementação no FoodConnect

### 1. Identity and Access Management (IAM)

#### Roles e Políticas

```typescript
// infrastructure/lib/security/iam-roles.ts
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

export class SecurityStack extends cdk.Stack {
  createECSTaskRole(): iam.Role {
    const taskRole = new iam.Role(this, "ECSTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      description: "Role for FoodConnect ECS tasks",
    });

    // S3 Access (apenas buckets específicos)
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        resources: [
          "arn:aws:s3:::foodconnect-images/*",
          "arn:aws:s3:::foodconnect-uploads/*",
        ],
      })
    );

    // Secrets Manager Access
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["secretsmanager:GetSecretValue"],
        resources: ["arn:aws:secretsmanager:*:*:secret:foodconnect/*"],
      })
    );

    // CloudWatch Logs
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["*"],
      })
    );

    return taskRole;
  }
}
```

### 2. Secrets Management

#### AWS Secrets Manager

```typescript
// backend/src/config/secrets.config.ts
import { SecretsManager } from "aws-sdk";

export class SecretsService {
  private secretsManager = new SecretsManager();

  async getSecret(secretName: string): Promise<any> {
    try {
      const response = await this.secretsManager
        .getSecretValue({ SecretId: secretName })
        .promise();

      return JSON.parse(response.SecretString || "{}");
    } catch (error) {
      console.error(`Error retrieving secret ${secretName}:`, error);
      throw error;
    }
  }

  async getDatabaseCredentials() {
    return this.getSecret("foodconnect/database");
  }

  async getJWTSecret() {
    const secrets = await this.getSecret("foodconnect/auth");
    return secrets.jwtSecret;
  }

  async getAWSKeys() {
    return this.getSecret("foodconnect/aws");
  }
}
```

#### Uso no Código

```typescript
// backend/src/main.ts
import { SecretsService } from "./config/secrets.config";

async function bootstrap() {
  const secretsService = new SecretsService();

  // Carregar secrets do AWS Secrets Manager
  const dbCreds = await secretsService.getDatabaseCredentials();
  const jwtSecret = await secretsService.getJWTSecret();

  // Configurar aplicação com secrets
  process.env.DATABASE_URL = `postgresql://${dbCreds.username}:${dbCreds.password}@${dbCreds.host}:${dbCreds.port}/${dbCreds.database}`;
  process.env.JWT_SECRET = jwtSecret;

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
```

### 3. Network Security

#### VPC e Security Groups

```typescript
// infrastructure/lib/network/vpc-config.ts
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class NetworkStack extends cdk.Stack {
  createVPC(): ec2.Vpc {
    return new ec2.Vpc(this, "FoodConnectVPC", {
      maxAzs: 3,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: "Isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });
  }

  createSecurityGroups(vpc: ec2.Vpc) {
    // ALB Security Group
    const albSG = new ec2.SecurityGroup(this, "ALBSecurityGroup", {
      vpc,
      description: "Security group for Application Load Balancer",
      allowAllOutbound: true,
    });
    albSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), "HTTPS");
    albSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "HTTP");

    // ECS Security Group
    const ecsSG = new ec2.SecurityGroup(this, "ECSSecurityGroup", {
      vpc,
      description: "Security group for ECS tasks",
      allowAllOutbound: true,
    });
    ecsSG.addIngressRule(albSG, ec2.Port.tcp(3000), "ALB to ECS");

    // RDS Security Group
    const rdsSG = new ec2.SecurityGroup(this, "RDSSecurityGroup", {
      vpc,
      description: "Security group for RDS database",
      allowAllOutbound: false,
    });
    rdsSG.addIngressRule(ecsSG, ec2.Port.tcp(5432), "ECS to RDS");

    // ElastiCache Security Group
    const cacheSG = new ec2.SecurityGroup(this, "CacheSecurityGroup", {
      vpc,
      description: "Security group for ElastiCache",
      allowAllOutbound: false,
    });
    cacheSG.addIngressRule(ecsSG, ec2.Port.tcp(6379), "ECS to Redis");

    return { albSG, ecsSG, rdsSG, cacheSG };
  }
}
```

### 4. Data Protection

#### Encryption at Rest

```typescript
// infrastructure/lib/storage/rds-encryption.ts
import * as rds from "aws-cdk-lib/aws-rds";
import * as kms from "aws-cdk-lib/aws-kms";

export class DataEncryption {
  createEncryptedDatabase(vpc: ec2.Vpc): rds.DatabaseInstance {
    // KMS Key for RDS encryption
    const kmsKey = new kms.Key(this, "RDSEncryptionKey", {
      description: "KMS key for RDS encryption",
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    return new rds.DatabaseInstance(this, "Database", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      vpc,
      // Encryption at rest
      storageEncrypted: true,
      storageEncryptionKey: kmsKey,
      // Backup encryption
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: false,
      // Multi-AZ para alta disponibilidade
      multiAz: true,
    });
  }

  createEncryptedS3Bucket(): s3.Bucket {
    return new s3.Bucket(this, "EncryptedBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      // Ou usar KMS para mais controle
      // encryption: s3.BucketEncryption.KMS,
      // encryptionKey: kmsKey,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
  }
}
```

#### Encryption in Transit

```typescript
// backend/src/main.ts
import * as fs from "fs";
import * as https from "https";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar HTTPS
  const httpsOptions = {
    key: fs.readFileSync("./secrets/private-key.pem"),
    cert: fs.readFileSync("./secrets/certificate.pem"),
  };

  // Helmet para headers de segurança
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // CORS configurado corretamente
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  await app.listen(3000);
}
```

### 5. Application Security

#### Input Validation e Sanitization

```typescript
// backend/src/common/pipes/validation.pipe.ts
import { ValidationPipe } from "@nestjs/common";

export const validationPipe = new ValidationPipe({
  whitelist: true, // Remove propriedades não declaradas no DTO
  forbidNonWhitelisted: true, // Retorna erro se propriedades extras forem enviadas
  transform: true, // Transforma payloads para instâncias de DTO
  transformOptions: {
    enableImplicitConversion: true,
  },
});
```

```typescript
// backend/src/posts/dto/create-post.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
} from "class-validator";
import { Sanitize } from "class-sanitizer";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @Sanitize() // Remove HTML/JS malicioso
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrls?: string;

  @IsOptional()
  @IsUUID()
  establishmentId?: string;
}
```

#### Rate Limiting

```typescript
// backend/src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import Redis from "ioredis";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector, private redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;

    const limit = 100; // requests
    const window = 60; // seconds
    const key = `rate_limit:${userId}`;

    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, window);
    }

    if (current > limit) {
      throw new HttpException(
        "Too many requests",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
```

#### SQL Injection Protection

```typescript
// Prisma ORM já previne SQL Injection
// Mas sempre use prepared statements

// ❌ NUNCA faça isso:
const posts = await prisma.$queryRaw`
  SELECT * FROM posts WHERE userId = ${userId}
`;

// ✅ SEMPRE faça isso:
const posts = await prisma.post.findMany({
  where: { userId },
});

// Ou use prepared statements:
const posts = await prisma.$queryRaw`
  SELECT * FROM posts WHERE userId = ${Prisma.raw(userId)}
`;
```

### 6. WAF (Web Application Firewall)

```typescript
// infrastructure/lib/security/waf.ts
import * as wafv2 from "aws-cdk-lib/aws-wafv2";

export class WAFStack extends cdk.Stack {
  createWAF(): wafv2.CfnWebACL {
    return new wafv2.CfnWebACL(this, "FoodConnectWAF", {
      defaultAction: { allow: {} },
      scope: "CLOUDFRONT",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "FoodConnectWAF",
        sampledRequestsEnabled: true,
      },
      rules: [
        // AWS Managed Rules - Core Rule Set
        {
          name: "AWSManagedRulesCommonRuleSet",
          priority: 1,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesCommonRuleSet",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "AWSManagedRulesCommonRuleSet",
            sampledRequestsEnabled: true,
          },
        },
        // SQL Injection Protection
        {
          name: "AWSManagedRulesSQLiRuleSet",
          priority: 2,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesSQLiRuleSet",
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "SQLi",
            sampledRequestsEnabled: true,
          },
        },
        // Rate Limiting
        {
          name: "RateLimitRule",
          priority: 3,
          statement: {
            rateBasedStatement: {
              limit: 2000,
              aggregateKeyType: "IP",
            },
          },
          action: { block: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "RateLimit",
            sampledRequestsEnabled: true,
          },
        },
      ],
    });
  }
}
```

### 7. Security Monitoring

#### GuardDuty e Security Hub

```typescript
// infrastructure/lib/security/monitoring.ts
import * as guardduty from "aws-cdk-lib/aws-guardduty";
import * as securityhub from "aws-cdk-lib/aws-securityhub";

export class SecurityMonitoring extends cdk.Stack {
  enableSecurityMonitoring() {
    // Enable GuardDuty
    new guardduty.CfnDetector(this, "GuardDutyDetector", {
      enable: true,
      findingPublishingFrequency: "FIFTEEN_MINUTES",
    });

    // Enable Security Hub
    new securityhub.CfnHub(this, "SecurityHub", {
      tags: { Environment: "production" },
    });

    // CloudWatch Alarm for security events
    const securityAlarm = new cloudwatch.Alarm(this, "SecurityAlarm", {
      metric: new cloudwatch.Metric({
        namespace: "AWS/GuardDuty",
        metricName: "Finding",
        statistic: "Sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: "Alert on GuardDuty findings",
    });

    // SNS para notificações
    const securityTopic = new sns.Topic(this, "SecurityTopic");
    securityAlarm.addAlarmAction(new snsActions.SnsAction(securityTopic));
  }
}
```

## 📊 Security Checklist

### Infrastructure Security

- [ ] VPC com subnets públicas/privadas/isoladas
- [ ] Security Groups com least privilege
- [ ] NACLs configurados
- [ ] WAF habilitado no CloudFront
- [ ] GuardDuty habilitado
- [ ] Security Hub habilitado
- [ ] AWS Config habilitado

### Data Protection

- [ ] RDS encryption at rest (KMS)
- [ ] S3 encryption at rest
- [ ] Backups automáticos habilitados
- [ ] SSL/TLS em todas as comunicações
- [ ] Secrets Manager para credenciais
- [ ] Parameter Store para configs

### Application Security

- [ ] Input validation em todos os endpoints
- [ ] Rate limiting implementado
- [ ] CORS configurado corretamente
- [ ] Helmet para security headers
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection

### Identity & Access

- [ ] IAM roles com least privilege
- [ ] MFA habilitado para usuários AWS
- [ ] JWT com refresh tokens
- [ ] Password hashing (bcrypt)
- [ ] Account lockout após tentativas falhas
- [ ] Audit logs de autenticação

### Monitoring & Response

- [ ] CloudWatch alarms para eventos de segurança
- [ ] X-Ray tracing habilitado
- [ ] CloudTrail habilitado
- [ ] Incident response playbook
- [ ] Security patching automatizado
- [ ] Vulnerability scanning

## 🎓 Recursos

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
