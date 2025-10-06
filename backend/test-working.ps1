# Testes Automatizados FoodConnect - Versão Corrigida
Write-Host "🧪 Testando Sistema de Seguir Usuários..." -ForegroundColor Blue

$base = "http://localhost:3000"
$user1 = "cmgeycxk3000gv8e49s49cada"  
$user2 = "cmgeycxhu0000v8e4t9vr2lo7"
$passed = 0
$total = 0

# Teste 1: Perfil básico
$total++
Write-Host ""
Write-Host "Teste 1: Perfil básico" -ForegroundColor Cyan
try {
    $url1 = $base + "/users/" + $user1 + "/profile"
    $response = Invoke-RestMethod -Uri $url1 -Method GET
    Write-Host "✅ Sucesso - Posts: $($response.stats.postsCount), Seguidores: $($response.stats.followersCount)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Seguir usuário
$total++
Write-Host ""
Write-Host "Teste 2: Seguir usuário" -ForegroundColor Cyan
try {
    $url2 = $base + "/users/" + $user1 + "/follow/test?followerId=" + $user2
    $response = Invoke-RestMethod -Uri $url2 -Method POST
    Write-Host "✅ Sucesso - Ação: $($response.data.action)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Verificar seguidores
$total++
Write-Host ""
Write-Host "Teste 3: Lista de seguidores" -ForegroundColor Cyan
try {
    $url3 = $base + "/users/" + $user1 + "/followers"
    $response = Invoke-RestMethod -Uri $url3 -Method GET
    Write-Host "✅ Sucesso - Seguidores: $($response.data.Count)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 4: Feed personalizado
$total++
Write-Host ""
Write-Host "Teste 4: Feed personalizado" -ForegroundColor Cyan
try {
    $url4 = $base + "/posts/feed/personalized?userId=" + $user2
    $response = Invoke-WebRequest -Uri $url4 -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Sucesso - Feed personalizado funcionando" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Resultado final
Write-Host ""
Write-Host "📊 Resultado: $passed/$total testes passaram" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "🎉 Todos os testes passaram! Sistema funcionando!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns testes falharam. Verifique os logs acima." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Para testar manualmente:" -ForegroundColor Cyan
Write-Host "- Perfil: GET $base/users/$user1/profile" -ForegroundColor Gray
Write-Host "- Seguir: POST $base/users/$user1/follow/test" -ForegroundColor Gray
Write-Host "- Feed: GET $base/posts/feed/personalized" -ForegroundColor Gray