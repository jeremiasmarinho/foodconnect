# 🚀 FoodConnect - Script de Setup Automático (Windows)
# Este script configura o ambiente de desenvolvimento do FoodConnect

Write-Host "🚀 FoodConnect - Setup Automático" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Verificar se Node.js está instalado
try {
  $nodeVersion = node --version
  Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
}
catch {
  Write-Host "❌ Node.js não encontrado. Instale Node.js v18+ primeiro." -ForegroundColor Red
  exit 1
}

# Verificar se PostgreSQL está instalado
try {
  $psqlVersion = psql --version
  Write-Host "✅ PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
}
catch {
  Write-Host "❌ PostgreSQL não encontrado. Instale PostgreSQL v14+ primeiro." -ForegroundColor Red
  Write-Host "💡 Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
  exit 1
}

Write-Host "✅ Pré-requisitos verificados" -ForegroundColor Green

# Instalar dependências do backend
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Blue
Set-Location backend

npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
  exit 1
}

# Configurar arquivo .env se não existir
if (-not (Test-Path ".env")) {
  Write-Host "⚙️ Configurando arquivo .env..." -ForegroundColor Blue
  Copy-Item ".env.example" ".env"
  Write-Host "📝 Arquivo .env criado. Configure as variáveis antes de continuar." -ForegroundColor Yellow
  Write-Host "💡 Edite o arquivo backend/.env com suas credenciais do PostgreSQL" -ForegroundColor Yellow
}

# Executar migrações do Prisma
Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Blue
npx prisma migrate dev --name init
npx prisma generate

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Erro ao configurar banco de dados" -ForegroundColor Red
  Write-Host "💡 Certifique-se de que PostgreSQL está rodando e as credenciais estão corretas no .env" -ForegroundColor Yellow
  exit 1
}

# Voltar para raiz e instalar dependências do frontend
Set-Location ..
Write-Host "📱 Instalando dependências do frontend..." -ForegroundColor Blue
Set-Location frontend

npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
  exit 1
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Setup concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Blue
Write-Host "1. Configure o arquivo backend/.env com suas credenciais" -ForegroundColor White
Write-Host "2. Execute 'cd backend; npm run start:dev' para iniciar o backend" -ForegroundColor White
Write-Host "3. Execute 'cd frontend; npm run web' para iniciar o frontend" -ForegroundColor White
Write-Host "4. Acesse http://localhost:3000/seed/database para popular com dados de teste" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "❤️ Health Check: http://localhost:3000/health" -ForegroundColor Cyan

# Perguntar se quer iniciar o sistema automaticamente
$startSystem = Read-Host "🚀 Deseja iniciar o sistema agora? (y/N)"
if ($startSystem -eq "y" -or $startSystem -eq "Y") {
  Write-Host "🚀 Iniciando backend..." -ForegroundColor Green
    
  # Abrir novo terminal para backend
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"
    
  Start-Sleep 3
  Write-Host "📱 Aguarde o backend inicializar e pressione qualquer tecla para iniciar o frontend..." -ForegroundColor Yellow
  $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
  # Abrir novo terminal para frontend
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run web"
    
  Write-Host "✅ Sistema iniciado!" -ForegroundColor Green
  Write-Host "🌐 Backend: http://localhost:3000" -ForegroundColor Cyan
  Write-Host "📱 Frontend: http://localhost:8081" -ForegroundColor Cyan
}