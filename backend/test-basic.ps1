# Testes Automatizados FoodConnect - Versão Simples
Write-Host "🧪 Testando Sistema de Seguir Usuários..." -ForegroundColor Blue

$base = "http://localhost:3000"
$user1 = "cmgeycxk3000gv8e49s49cada"  
$user2 = "cmgeycxhu0000v8e4t9vr2lo7"
$passed = 0
$total = 0

# Teste 1: Perfil básico
$total++
Write-Host "`nTeste 1: Perfil básico" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "${base}/users/${user1}/profile" -Method GET
    Write-Host "✅ Sucesso - Posts: $($response.stats.postsCount), Seguidores: $($response.stats.followersCount)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Seguir usuário
$total++
Write-Host "`nTeste 2: Seguir usuário" -ForegroundColor Cyan
try {
    $followUrl = "${base}/users/${user1}/follow/test?followerId=${user2}"
    $response = Invoke-RestMethod -Uri $followUrl -Method POST
    Write-Host "✅ Sucesso - Ação: $($response.data.action)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Verificar seguidores
$total++
Write-Host "`nTeste 3: Lista de seguidores" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "${base}/users/${user1}/followers" -Method GET
    Write-Host "✅ Sucesso - Seguidores: $($response.data.Count)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 4: Feed personalizado
$total++
Write-Host "`nTeste 4: Feed personalizado" -ForegroundColor Cyan
try {
    $feedUrl = "${base}/posts/feed/personalized?userId=${user2}"
    $response = Invoke-WebRequest -Uri $feedUrl -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Sucesso - Feed personalizado funcionando" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Resultado final
Write-Host "`n📊 Resultado: $passed/$total testes passaram" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "🎉 Todos os testes passaram! Sistema funcionando!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns testes falharam. Verifique os logs acima." -ForegroundColor Yellow
}

Write-Host "`nPara testar manualmente:" -ForegroundColor Cyan
Write-Host "- Perfil: GET ${base}/users/${user1}/profile" -ForegroundColor Gray
Write-Host "- Seguir: POST ${base}/users/${user1}/follow/test?followerId=${user2}" -ForegroundColor Gray
Write-Host "- Feed: GET ${base}/posts/feed/personalized?userId=${user2}" -ForegroundColor Gray