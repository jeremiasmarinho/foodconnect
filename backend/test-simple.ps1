# Script de Testes Automatizados Simplificado - FoodConnect
Write-Host "🧪 Executando testes automatizados do FoodConnect..." -ForegroundColor Blue

$BaseUrl = "http://localhost:3000"
$User1Id = "cmgeycxk3000gv8e49s49cada"  
$User2Id = "cmgeycxhu0000v8e4t9vr2lo7"

$Tests = @(
    @{ Method = "GET"; Url = "$BaseUrl/users/$User1Id/profile"; Name = "Perfil básico" }
    @{ Method = "GET"; Url = "$BaseUrl/users/$User1Id/profile?currentUserId=$User2Id"; Name = "Perfil com follow status" }
    @{ Method = "POST"; Url = "$BaseUrl/users/$User1Id/follow/test?followerId=$User2Id"; Name = "Seguir usuário" }
    @{ Method = "GET"; Url = "$BaseUrl/users/$User1Id/followers"; Name = "Lista seguidores" }
    @{ Method = "GET"; Url = "$BaseUrl/users/$User2Id/following"; Name = "Lista seguindo" }
)

$PassedTests = 0
$TotalTests = $Tests.Count

foreach ($Test in $Tests) {
    Write-Host "`n🔍 Testando: $($Test.Name)" -ForegroundColor Cyan
    Write-Host "$($Test.Method) $($Test.Url)" -ForegroundColor Yellow
    
    try {
        $Response = Invoke-RestMethod -Uri $Test.Url -Method $Test.Method -ErrorAction Stop
        Write-Host "✅ PASSOU" -ForegroundColor Green
        $PassedTests++
        
        # Mostrar informações relevantes
        if ($Response.stats) {
            Write-Host "   Posts: $($Response.stats.postsCount), Seguidores: $($Response.stats.followersCount), Seguindo: $($Response.stats.followingCount)" -ForegroundColor Gray
        }
        if ($Response.data -and $Response.data.action) {
            Write-Host "   Ação: $($Response.data.action)" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "❌ FALHOU: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Testes especiais com URLs codificadas
Write-Host "`n🚀 Testando Feed Personalizado" -ForegroundColor Blue

try {
    $FeedUrl = "$BaseUrl/posts/feed/personalized?userId=$User2Id" + [System.Web.HttpUtility]::UrlEncode("&page=1&limit=3")
    $FeedResponse = Invoke-RestMethod -Uri "$BaseUrl/posts/feed/personalized" -Method GET -Body @{userId=$User2Id; page=1; limit=3} -ErrorAction Stop
    Write-Host "✅ Feed personalizado funcionando" -ForegroundColor Green
    Write-Host "   Posts encontrados: $($FeedResponse.data.Count)" -ForegroundColor Gray
    $PassedTests++
} catch {
    Write-Host "❌ Feed personalizado falhou" -ForegroundColor Red
}
$TotalTests++

# Relatório
Write-Host "`n📊 Relatório Final" -ForegroundColor Blue
Write-Host "Testes: $PassedTests/$TotalTests aprovados" -ForegroundColor $(if ($PassedTests -eq $TotalTests) { "Green" } else { "Yellow" })

if ($PassedTests -eq $TotalTests) {
    Write-Host "🎉 Sistema funcionando perfeitamente!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns testes falharam" -ForegroundColor Yellow
}

Write-Host "`n✨ Para executar novamente: .\test-simple.ps1" -ForegroundColor Cyan