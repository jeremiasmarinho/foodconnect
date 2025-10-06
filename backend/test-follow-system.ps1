# Script de Testes Automatizados - FoodConnect
# Testa o sistema de seguir usuários e feed personalizado

Write-Host "🧪 Executando testes automatizados do FoodConnect..." -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue

# Função para testar endpoints
function Test-Endpoint {
  param(
    [string]$Method,
    [string]$Url,
    [string]$Description,
    [int]$ExpectedStatus = 200
  )
    
  Write-Host "`n🔍 Testando: $Description" -ForegroundColor Cyan
  Write-Host "$Method $Url" -ForegroundColor Yellow
    
  try {
    $response = Invoke-RestMethod -Uri $Url -Method $Method -ErrorAction Stop
    Write-Host "✅ PASSOU" -ForegroundColor Green
        
    if ($Method -eq "GET" -and $response) {
      $jsonResponse = $response | ConvertTo-Json -Compress
      Write-Host "📄 Resposta: $jsonResponse" -ForegroundColor Gray
    }
    return $true
  }
  catch {
    Write-Host "❌ FALHOU: $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

# Variáveis de teste
$BaseUrl = "http://localhost:3000"
$User1Id = "cmgeycxk3000gv8e49s49cada"
$User2Id = "cmgeycxhu0000v8e4t9vr2lo7"

$passedTests = 0
$totalTests = 0

Write-Host "`n🚀 Testando Sistema de Usuários" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# 1. Teste de perfil básico
$totalTests++
if (Test-Endpoint -Method "GET" -Url "$BaseUrl/users/$User1Id/profile" -Description "Perfil básico do usuário") {
  $passedTests++
}

# 2. Teste de perfil com currentUserId  
$totalTests++
$profileWithUserUrl = "$BaseUrl/users/$User1Id/profile?currentUserId=$User2Id"
if (Test-Endpoint -Method "GET" -Url $profileWithUserUrl -Description "Perfil com status de seguimento") {
  $passedTests++
}

# 3. Teste de seguir usuário
$totalTests++
$followUrl = "$BaseUrl/users/$User1Id/follow/test?followerId=$User2Id"
if (Test-Endpoint -Method "POST" -Url $followUrl -Description "Seguir usuário") {
  $passedTests++
}

# 4. Verificar se as estatísticas foram atualizadas
Write-Host "`n🔄 Verificando atualização das estatísticas" -ForegroundColor Blue
$totalTests++
$profileAfterFollowUrl = "$BaseUrl/users/$User1Id/profile?currentUserId=$User2Id"
if (Test-Endpoint -Method "GET" -Url $profileAfterFollowUrl -Description "Perfil após seguir") {
  $passedTests++
}

# 5. Teste de lista de seguidores
$totalTests++
if (Test-Endpoint -Method "GET" -Url "$BaseUrl/users/$User1Id/followers" -Description "Lista de seguidores") {
  $passedTests++
}

# 6. Teste de lista de seguindo
$totalTests++
if (Test-Endpoint -Method "GET" -Url "$BaseUrl/users/$User2Id/following" -Description "Lista de usuários seguindo") {
  $passedTests++
}

# 7. Teste de unfollow (executar novamente)
$totalTests++
$unfollowUrl = "$BaseUrl/users/$User1Id/follow/test?followerId=$User2Id"
if (Test-Endpoint -Method "POST" -Url $unfollowUrl -Description "Deixar de seguir usuário") {
  $passedTests++
}

Write-Host "`n🚀 Testando Feed Personalizado" -ForegroundColor Blue
Write-Host "==============================" -ForegroundColor Blue

# 8. Teste de feed personalizado
$totalTests++
$personalizedFeedUrl = "$BaseUrl/posts/feed/personalized?userId=$User2Id" + '&page=1&limit=3'
if (Test-Endpoint -Method "GET" -Url $personalizedFeedUrl -Description "Feed personalizado") {
  $passedTests++
}

# 9. Teste de feed com filtros
$totalTests++
$filteredFeedUrl = "$BaseUrl/posts/feed/filtered?cuisine=Italiana" + '&page=1&limit=2'
if (Test-Endpoint -Method "GET" -Url $filteredFeedUrl -Description "Feed com filtros") {
  $passedTests++
}# Relatório final
Write-Host "`n📊 Relatório dos Testes" -ForegroundColor Blue
Write-Host "=======================" -ForegroundColor Blue
Write-Host "Testes executados: $totalTests" -ForegroundColor White
Write-Host "Testes aprovados: $passedTests" -ForegroundColor Green
Write-Host "Testes falharam: $($totalTests - $passedTests)" -ForegroundColor Red

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "Taxa de sucesso: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
  Write-Host "`n🎉 Todos os testes passaram! Sistema funcionando perfeitamente!" -ForegroundColor Green
}
else {
  Write-Host "`n⚠️  Alguns testes falharam. Verifique os logs acima." -ForegroundColor Yellow
}

# Executar testes unitários Jest (se disponível)
Write-Host "`n🧪 Executando Testes Unitários" -ForegroundColor Blue
Write-Host "===============================" -ForegroundColor Blue

if (Test-Path "package.json") {
  $packageJson = Get-Content "package.json" | ConvertFrom-Json
  if ($packageJson.devDependencies -and ($packageJson.devDependencies.jest -or $packageJson.devDependencies."@nestjs/testing")) {
    Write-Host "Executando testes Jest..." -ForegroundColor Cyan
    npm test -- --testPathPattern=users.service.spec.ts --verbose --silent
  }
  else {
    Write-Host "⚠️  Jest não configurado. Configure com:" -ForegroundColor Yellow
    Write-Host "npm install --save-dev jest @types/jest @nestjs/testing" -ForegroundColor Gray
  }
}
else {
  Write-Host "❌ package.json não encontrado" -ForegroundColor Red
}

Write-Host "`n✨ Dica: Execute este script sempre que fizer mudanças no código!" -ForegroundColor Green
Write-Host "Para executar: .\test-follow-system.ps1" -ForegroundColor Gray