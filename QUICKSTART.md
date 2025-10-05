# 🚀 FoodConnect - Guia de Deploy Rápido

Este guia mostra como fazer o deploy completo do FoodConnect usando Docker em poucos minutos.

## ⚡ Deploy em 5 Minutos

### 1. Verificar Pré-requisitos

Certifique-se de ter:

- ✅ **Docker Desktop** instalado e rodando
- ✅ **Git** para clonar o repositório
- ✅ **PowerShell** (Windows) ou **Bash** (Linux/macOS)

### 2. Clonar e Configurar

```powershell
# Clone o repositório
git clone https://github.com/jeremiasmarinho/foodconnect.git
cd foodconnect

# Copie a configuração de exemplo
cp .env.example .env

# Edite as senhas (obrigatório para segurança)
notepad .env
```

### 3. Configurar Variáveis Essenciais

Edite o arquivo `.env` e altere pelo menos estas variáveis:

```env
# ⚠️ OBRIGATÓRIO: Mude estas senhas
POSTGRES_PASSWORD=sua_senha_postgres_aqui_32chars
REDIS_PASSWORD=sua_senha_redis_aqui_32chars
JWT_SECRET=sua_chave_jwt_super_secreta_256bits

# ✅ Deixe o resto como está para teste local
POSTGRES_DB=foodconnect
POSTGRES_USER=foodconnect
DATABASE_URL=postgresql://foodconnect:sua_senha_postgres_aqui_32chars@postgres:5432/foodconnect
```

### 4. Executar Deploy

```powershell
# Windows PowerShell
.\deploy.ps1 -Environment production
```

```bash
# Linux/macOS
chmod +x deploy.sh
./deploy.sh production
```

### 5. Verificar se Funcionou

Acesse no seu navegador:

- **Aplicação Principal**: http://localhost
- **API Backend**: http://localhost/api
- **Documentação API**: http://localhost/api/docs
- **Health Check**: http://localhost/health

## 🎯 O que Aconteceu no Deploy

O script automaticamente:

1. ✅ **Verificou** Docker e dependências
2. ✅ **Parou** containers antigos (se existirem)
3. ✅ **Construiu** as imagens Docker otimizadas
4. ✅ **Iniciou** todos os serviços:
   - **Nginx** (proxy reverso)
   - **Frontend** React/Next.js
   - **Backend** NestJS
   - **PostgreSQL** (banco de dados)
   - **Redis** (cache)
5. ✅ **Executou** migrações do banco
6. ✅ **Verificou** saúde dos serviços

## 🏗️ Serviços Rodando

Após o deploy bem-sucedido, você terá:

| Serviço      | URL                       | Porta | Função               |
| ------------ | ------------------------- | ----- | -------------------- |
| **Frontend** | http://localhost          | 80    | Interface do usuário |
| **Backend**  | http://localhost/api      | 80    | API REST             |
| **Docs**     | http://localhost/api/docs | 80    | Swagger API          |
| **Health**   | http://localhost/health   | 80    | Status dos serviços  |

## 🔧 Comandos Úteis

### Ver Logs

```powershell
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Status dos Containers

```powershell
docker-compose ps
```

### Parar Tudo

```powershell
docker-compose down
```

### Reiniciar um Serviço

```powershell
docker-compose restart backend
```

## 🐛 Solução de Problemas

### ❌ "Docker não está rodando"

**Solução**: Abra o Docker Desktop e aguarde inicializar

### ❌ "Porta 80 já está em uso"

**Solução**: Pare outros serviços web ou mude as portas no `docker-compose.yml`

### ❌ "Database connection failed"

**Soluções**:

1. Aguarde mais tempo (banco pode demorar para inicializar)
2. Verifique se a senha no `.env` está correta
3. Execute: `docker-compose restart postgres`

### ❌ "Build failed"

**Solução**: Limpe o cache e tente novamente:

```powershell
docker system prune -a
.\deploy.ps1 -Environment production
```

## 📊 Verificação de Saúde

Para verificar se tudo está funcionando:

```powershell
# Teste rápido de todas as APIs
curl http://localhost/health
curl http://localhost/api/health
curl http://localhost/api/docs
```

Resposta esperada:

- **Status 200** para todos
- **JSON** com informações de saúde

## 🎉 Próximos Passos

Agora que o FoodConnect está rodando:

1. **Explore a API**: http://localhost/api/docs
2. **Teste o Frontend**: http://localhost
3. **Monitore Logs**: `docker-compose logs -f`
4. **Customize**: Edite `.env` para suas necessidades
5. **Deploy Produção**: Configure SSL e domínio próprio

## 📞 Precisa de Ajuda?

- 📖 **Documentação Completa**: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 **Problemas**: [GitHub Issues](https://github.com/jeremiasmarinho/foodconnect/issues)
- 💬 **Suporte**: Crie uma issue no repositório

---

**⏱️ Tempo total**: ~5 minutos  
**🎯 Resultado**: FoodConnect rodando completo com Docker  
**🚀 Status**: Pronto para desenvolvimento e testes!
