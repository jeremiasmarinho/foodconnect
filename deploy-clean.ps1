# FoodConnect Deploy Script - Versao Compativel PowerShell
# Executa o deploy completo do FoodConnect usando Docker

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "production", "staging")]
    [string]$Environment
)

Write-Host "FoodConnect Deployment Script" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Verificar Docker
Write-Host "Checking Docker..." -ForegroundColor Cyan
try {
    docker info | Out-Null
    Write-Host "OK: Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Cyan
try {
    docker-compose --version | Out-Null
    Write-Host "OK: Docker Compose is available" -ForegroundColor Green
    $composeCmd = "docker-compose"
} catch {
    try {
        docker compose version | Out-Null
        Write-Host "OK: Docker Compose is available" -ForegroundColor Green
        $composeCmd = "docker compose"
    } catch {
        Write-Host "ERROR: Docker Compose is not available" -ForegroundColor Red
        exit 1
    }
}

# Verificar arquivo .env
Write-Host "Checking environment file..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "OK: Environment file found" -ForegroundColor Green
} else {
    Write-Host "ERROR: Environment file .env not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure it" -ForegroundColor Yellow
    exit 1
}

# Parar serviços existentes
Write-Host "Stopping existing services..." -ForegroundColor Cyan
try {
    if ($composeCmd -eq "docker-compose") {
        docker-compose down --remove-orphans 2>$null
    } else {
        docker compose down --remove-orphans 2>$null
    }
    Write-Host "OK: Services stopped" -ForegroundColor Green
} catch {
    Write-Host "WARNING: No services were running" -ForegroundColor Yellow
}

# Construir imagens
Write-Host "Building Docker images..." -ForegroundColor Cyan
try {
    if ($composeCmd -eq "docker-compose") {
        docker-compose build --no-cache
    } else {
        docker compose build --no-cache
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Docker images built successfully" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to build Docker images" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Error building Docker images" -ForegroundColor Red
    exit 1
}

# Iniciar serviços
Write-Host "Starting services..." -ForegroundColor Cyan
try {
    if ($composeCmd -eq "docker-compose") {
        docker-compose --env-file .env up -d
    } else {
        docker compose --env-file .env up -d
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Services started successfully" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to start services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Error starting services" -ForegroundColor Red
    exit 1
}

# Aguardar banco de dados
Write-Host "Waiting for database..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    try {
        if ($composeCmd -eq "docker-compose") {
            docker-compose exec -T postgres pg_isready -U foodconnect 2>$null
        } else {
            docker compose exec -T postgres pg_isready -U foodconnect 2>$null
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK: Database is ready" -ForegroundColor Green
            break
        }
    } catch {
        # Continue tentando
    }
    
    Write-Host "Waiting for database... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
} while ($attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Host "ERROR: Database failed to start" -ForegroundColor Red
    exit 1
}

# Gerar cliente Prisma
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
try {
    if ($composeCmd -eq "docker-compose") {
        docker-compose exec -T backend npx prisma generate
    } else {
        docker compose exec -T backend npx prisma generate
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Prisma client generated" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Prisma client generation failed, but continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: Error generating Prisma client, but continuing..." -ForegroundColor Yellow
}

# Executar migrações
Write-Host "Running database migrations..." -ForegroundColor Cyan
try {
    if ($composeCmd -eq "docker-compose") {
        docker-compose exec -T backend npx prisma migrate deploy
    } else {
        docker compose exec -T backend npx prisma migrate deploy
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Database migrations completed" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Database migrations failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Error running migrations" -ForegroundColor Red
    exit 1
}

# Verificar saúde dos serviços
Write-Host "Checking service health..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$services = @("nginx", "frontend", "backend", "postgres", "redis")
foreach ($service in $services) {
    try {
        if ($composeCmd -eq "docker-compose") {
            $containerId = docker-compose ps -q $service
        } else {
            $containerId = docker compose ps -q $service
        }
        
        if ($containerId) {
            Write-Host "OK: Service $service is running" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Service $service may not be running" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "WARNING: Could not check service $service" -ForegroundColor Yellow
    }
}

# Mostrar resumo
Write-Host ""
Write-Host "Deployment Summary" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Environment: " -NoNewline
Write-Host $Environment -ForegroundColor Yellow
Write-Host "Services: " -NoNewline  
Write-Host "nginx, frontend, backend, postgres, redis" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Blue
Write-Host "  Frontend:     http://localhost"
Write-Host "  Backend API:  http://localhost/api"
Write-Host "  API Docs:     http://localhost/api/docs"
Write-Host "  Health Check: http://localhost/health"
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Blue
Write-Host "  View logs:    $composeCmd logs -f"
Write-Host "  Stop services: $composeCmd down"
Write-Host "  Restart:      $composeCmd restart"
Write-Host "  Status:       $composeCmd ps"
Write-Host ""
Write-Host "SUCCESS: Deployment completed successfully!" -ForegroundColor Green