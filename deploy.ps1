# FoodConnect Deployment Script for Windows PowerShell
# Author: GitHub Copilot
# Description: Automated deployment script for FoodConnect application

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "production", "staging")]
    [string]$Environment,
    
    [switch]$SkipBuild,
    [switch]$SkipMigrations,
    [switch]$Verbose,
    [switch]$Help
)

# Show help information
if ($Help) {
    Write-Host @"
FoodConnect Deployment Script

USAGE:
    .\deploy.ps1 -Environment <env> [OPTIONS]

PARAMETERS:
    -Environment    Target environment (development/production/staging)
    -SkipBuild     Skip Docker image building
    -SkipMigrations Skip database migrations
    -Verbose       Enable verbose output
    -Help          Show this help message

EXAMPLES:
    .\deploy.ps1 -Environment production
    .\deploy.ps1 -Environment development -SkipBuild
    .\deploy.ps1 -Environment production -Verbose

REQUIREMENTS:
    - Docker Desktop installed and running
    - Docker Compose available
    - Environment file (.env) configured
"@
    exit 0
}

# Enable verbose output if requested
if ($Verbose) {
    $VerbosePreference = "Continue"
}

# Configuration
$PROJECT_NAME = "foodconnect"
$COMPOSE_FILE = "docker-compose.yml"
$ENV_FILE = ".env"

# Colors for output
function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    $colors = @{
        "Red" = [ConsoleColor]::Red
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Blue" = [ConsoleColor]::Blue
        "Magenta" = [ConsoleColor]::Magenta
        "Cyan" = [ConsoleColor]::Cyan
        "White" = [ConsoleColor]::White
    }
    
    Write-Host $Text -ForegroundColor $colors[$Color]
}

function Write-Step {
    param([string]$Message)
    Write-ColorText "🚀 $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorText "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorText "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorText "⚠️  $Message" "Yellow"
}

# Check if Docker is running
function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Check if Docker Compose is available
function Test-DockerCompose {
    try {
        docker-compose --version > $null 2>&1
        return $true
    }
    catch {
        try {
            docker compose version > $null 2>&1
            return $true
        }
        catch {
            return $false
        }
    }
}

# Get Docker Compose command
function Get-DockerComposeCommand {
    try {
        docker-compose --version > $null 2>&1
        return "docker-compose"
    }
    catch {
        return "docker compose"
    }
}

# Validate environment file
function Test-EnvironmentFile {
    if (-not (Test-Path $ENV_FILE)) {
        Write-Error "Environment file '$ENV_FILE' not found!"
        Write-Host "Please create the environment file with required variables."
        Write-Host "Example: cp .env.example $ENV_FILE"
        return $false
    }
    
    # Check for required variables
    $content = Get-Content $ENV_FILE -Raw
    $requiredVars = @(
        "POSTGRES_DB",
        "POSTGRES_USER", 
        "POSTGRES_PASSWORD",
        "DATABASE_URL",
        "JWT_SECRET"
    )
    
    $missing = @()
    foreach ($var in $requiredVars) {
        if ($content -notmatch "$var=.+") {
            $missing += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required environment variables:"
        $missing | ForEach-Object { Write-Host "  - $_" }
        return $false
    }
    
    return $true
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $allGood = $true
    
    # Check Docker
    if (-not (Test-DockerRunning)) {
        Write-Error "Docker is not running. Please start Docker Desktop."
        $allGood = $false
    } else {
        Write-Success "Docker is running"
    }
    
    # Check Docker Compose
    if (-not (Test-DockerCompose)) {
        Write-Error "Docker Compose is not available."
        $allGood = $false
    } else {
        Write-Success "Docker Compose is available"
    }
    
    # Check environment file
    if (-not (Test-EnvironmentFile)) {
        $allGood = $false
    } else {
        Write-Success "Environment file is valid"
    }
    
    # Check compose file
    if (-not (Test-Path $COMPOSE_FILE)) {
        Write-Error "Docker Compose file '$COMPOSE_FILE' not found!"
        $allGood = $false
    } else {
        Write-Success "Docker Compose file found"
    }
    
    return $allGood
}

# Stop existing services
function Stop-Services {
    param([string]$ComposeCmd)
    
    Write-Step "Stopping existing services..."
    
    try {
        & $ComposeCmd.Split() down --remove-orphans 2>$null
        Write-Success "Services stopped"
    }
    catch {
        Write-Warning "No services were running or error stopping services"
    }
}

# Build Docker images
function Build-Images {
    param([string]$ComposeCmd)
    
    if ($SkipBuild) {
        Write-Warning "Skipping Docker image build"
        return $true
    }
    
    Write-Step "Building Docker images..."
    
    try {
        $buildArgs = @($ComposeCmd.Split(), "build", "--no-cache")
        if ($Verbose) {
            $buildArgs += "--progress=plain"
        }
        
        $process = Start-Process -FilePath $buildArgs[0] -ArgumentList $buildArgs[1..($buildArgs.Length-1)] -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Success "Docker images built successfully"
            return $true
        } else {
            Write-Error "Failed to build Docker images"
            return $false
        }
    }
    catch {
        Write-Error "Error building Docker images: $($_.Exception.Message)"
        return $false
    }
}

# Start services
function Start-Services {
    param([string]$ComposeCmd)
    
    Write-Step "Starting services..."
    
    try {
        $startArgs = @($ComposeCmd.Split(), "--env-file", $ENV_FILE, "up", "-d")
        
        $process = Start-Process -FilePath $startArgs[0] -ArgumentList $startArgs[1..($startArgs.Length-1)] -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Success "Services started successfully"
            return $true
        } else {
            Write-Error "Failed to start services"
            return $false
        }
    }
    catch {
        Write-Error "Error starting services: $($_.Exception.Message)"
        return $false
    }
}

# Wait for database
function Wait-ForDatabase {
    param([string]$ComposeCmd)
    
    Write-Step "Waiting for database to be ready..."
    
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        Write-Verbose "Database check attempt $attempt/$maxAttempts"
        
        try {
            $checkArgs = @($ComposeCmd.Split(), "exec", "-T", "postgres", "pg_isready", "-U", "foodconnect")
            $process = Start-Process -FilePath $checkArgs[0] -ArgumentList $checkArgs[1..($checkArgs.Length-1)] -Wait -PassThru -NoNewWindow -RedirectStandardOutput $null -RedirectStandardError $null
            
            if ($process.ExitCode -eq 0) {
                Write-Success "Database is ready"
                return $true
            }
        }
        catch {
            Write-Verbose "Database not ready yet..."
        }
        
        if ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 2
        }
    } while ($attempt -lt $maxAttempts)
    
    Write-Error "Database failed to become ready after $maxAttempts attempts"
    return $false
}

# Run database migrations
function Invoke-Migrations {
    param([string]$ComposeCmd)
    
    if ($SkipMigrations) {
        Write-Warning "Skipping database migrations"
        return $true
    }
    
    Write-Step "Running database migrations..."
    
    try {
        $migrateArgs = @($ComposeCmd.Split(), "exec", "-T", "backend", "npx", "prisma", "migrate", "deploy")
        $process = Start-Process -FilePath $migrateArgs[0] -ArgumentList $migrateArgs[1..($migrateArgs.Length-1)] -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Success "Database migrations completed"
            return $true
        } else {
            Write-Error "Database migrations failed"
            return $false
        }
    }
    catch {
        Write-Error "Error running migrations: $($_.Exception.Message)"
        return $false
    }
}

# Generate Prisma client
function Invoke-PrismaGenerate {
    param([string]$ComposeCmd)
    
    Write-Step "Generating Prisma client..."
    
    try {
        $generateArgs = @($ComposeCmd.Split(), "exec", "-T", "backend", "npx", "prisma", "generate")
        $process = Start-Process -FilePath $generateArgs[0] -ArgumentList $generateArgs[1..($generateArgs.Length-1)] -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Success "Prisma client generated"
            return $true
        } else {
            Write-Error "Prisma client generation failed"
            return $false
        }
    }
    catch {
        Write-Error "Error generating Prisma client: $($_.Exception.Message)"
        return $false
    }
}

# Check service health
function Test-ServiceHealth {
    param([string]$ComposeCmd)
    
    Write-Step "Checking service health..."
    
    # Wait a moment for services to fully start
    Start-Sleep -Seconds 5
    
    $services = @("nginx", "frontend", "backend", "postgres", "redis")
    $healthyServices = @()
    $unhealthyServices = @()
    
    foreach ($service in $services) {
        try {
            $statusArgs = @($ComposeCmd.Split(), "ps", "-q", $service)
            $containerId = & $statusArgs[0] $statusArgs[1..($statusArgs.Length-1)] 2>$null | Select-Object -First 1
            
            if ($containerId) {
                $inspectResult = docker inspect $containerId --format='{{.State.Health.Status}}' 2>$null
                
                if ($inspectResult -eq "healthy" -or $inspectResult -eq "") {
                    $healthyServices += $service
                    Write-Success "Service '$service' is healthy"
                } else {
                    $unhealthyServices += $service
                    Write-Warning "Service '$service' is not healthy (status: $inspectResult)"
                }
            } else {
                $unhealthyServices += $service
                Write-Warning "Service '$service' is not running"
            }
        }
        catch {
            $unhealthyServices += $service
            Write-Warning "Could not check health of service '$service'"
        }
    }
    
    if ($unhealthyServices.Count -eq 0) {
        Write-Success "All services are healthy"
        return $true
    } else {
        Write-Warning "Some services are not healthy: $($unhealthyServices -join ', ')"
        return $false
    }
}

# Show deployment summary
function Show-DeploymentSummary {
    Write-Host ""
    Write-ColorText "🎉 Deployment Summary" "Magenta"
    Write-Host "===================="
    Write-Host ""
    
    Write-Host "Environment: " -NoNewline
    Write-ColorText $Environment "Yellow"
    
    Write-Host "Services: " -NoNewline
    Write-ColorText "nginx, frontend, backend, postgres, redis" "Cyan"
    
    Write-Host ""
    Write-ColorText "📱 Application URLs:" "Blue"
    Write-Host "  Frontend:     http://localhost"
    Write-Host "  Backend API:  http://localhost/api"
    Write-Host "  API Docs:     http://localhost/api/docs"
    Write-Host "  Health Check: http://localhost/health"
    
    Write-Host ""
    Write-ColorText "🔧 Useful Commands:" "Blue"
    Write-Host "  View logs:    docker-compose logs -f"
    Write-Host "  Stop services: docker-compose down"
    Write-Host "  Restart:      docker-compose restart"
    Write-Host "  Status:       docker-compose ps"
    
    Write-Host ""
}

# Main deployment function
function Start-Deployment {
    Write-ColorText "🍽️ FoodConnect Deployment Script" "Magenta"
    Write-ColorText "=================================" "Magenta"
    Write-Host ""
    
    Write-Host "Environment: " -NoNewline
    Write-ColorText $Environment "Yellow"
    Write-Host "Timestamp: " -NoNewline
    Write-ColorText (Get-Date -Format "yyyy-MM-dd HH:mm:ss") "Gray"
    Write-Host ""
    
    # Get Docker Compose command
    $composeCmd = Get-DockerComposeCommand
    Write-Verbose "Using Docker Compose command: $composeCmd"
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Error "Prerequisites check failed. Please fix the issues above."
        exit 1
    }
    
    # Stop existing services
    Stop-Services -ComposeCmd $composeCmd
    
    # Build images
    if (-not (Build-Images -ComposeCmd $composeCmd)) {
        Write-Error "Image build failed. Deployment aborted."
        exit 1
    }
    
    # Start services
    if (-not (Start-Services -ComposeCmd $composeCmd)) {
        Write-Error "Failed to start services. Deployment aborted."
        exit 1
    }
    
    # Wait for database
    if (-not (Wait-ForDatabase -ComposeCmd $composeCmd)) {
        Write-Error "Database failed to start. Deployment aborted."
        exit 1
    }
    
    # Generate Prisma client
    if (-not (Invoke-PrismaGenerate -ComposeCmd $composeCmd)) {
        Write-Warning "Prisma client generation failed, but continuing..."
    }
    
    # Run migrations
    if (-not (Invoke-Migrations -ComposeCmd $composeCmd)) {
        Write-Error "Database migrations failed. Deployment aborted."
        exit 1
    }
    
    # Check service health
    Test-ServiceHealth -ComposeCmd $composeCmd | Out-Null
    
    # Show summary
    Show-DeploymentSummary
    
    Write-Success "🎉 Deployment completed successfully!"
}

# Start deployment
try {
    Start-Deployment
}
catch {
    Write-Error "Deployment failed with error: $($_.Exception.Message)"
    Write-Host "Stack trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}