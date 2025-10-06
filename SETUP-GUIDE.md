# 🚀 FoodConnect - Guia de Instalação e Execução

## 📋 **Pré-requisitos**

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- ✅ **npm** (vem com Node.js)
- ✅ **PostgreSQL** (v14 ou superior) - [Download](https://www.postgresql.org/download/)
- ✅ **Git** - [Download](https://git-scm.com/)

## 🗃️ **1. Configuração do Banco de Dados**

### **PostgreSQL Setup:**

1. **Instale e inicie o PostgreSQL**
2. **Acesse o PostgreSQL:**

   ```bash
   psql -U postgres
   ```

3. **Crie o banco de dados:**
   ```sql
   CREATE DATABASE foodconnect_dev;
   CREATE USER foodconnect_user WITH ENCRYPTED PASSWORD 'foodconnect_password';
   GRANT ALL PRIVILEGES ON DATABASE foodconnect_dev TO foodconnect_user;
   \q
   ```

## 📥 **2. Clone e Instalação**

### **Clone o repositório:**

```bash
git clone https://github.com/jeremiasmarinho/foodconnect.git
cd foodconnect
```

### **Instale dependências do backend:**

```bash
cd backend
npm install
```

### **Instale dependências do frontend:**

```bash
cd ../frontend
npm install
cd ..
```

## ⚙️ **3. Configuração de Ambiente**

### **Configure o arquivo .env no backend:**

1. **Copie o exemplo:**

   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edite o arquivo .env:**

   ```env
   # Database
   DATABASE_URL="postgresql://foodconnect_user:foodconnect_password@localhost:5432/foodconnect_dev"

   # JWT
   JWT_SECRET="seu_jwt_secret_super_secreto_aqui"
   JWT_EXPIRES_IN="7d"

   # App
   NODE_ENV="development"
   PORT=3000

   # Upload
   UPLOAD_DEST="./storage/uploads"
   MAX_FILE_SIZE=10485760

   # Email (opcional para desenvolvimento)
   SMTP_HOST="localhost"
   SMTP_PORT=587
   SMTP_USER=""
   SMTP_PASS=""
   ```

## 🗄️ **4. Configuração do Banco**

### **Execute as migrações:**

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## 🚀 **5. Executar o Sistema**

### **Terminal 1 - Backend:**

```bash
cd backend
npm run start:dev
```

**✅ Aguarde ver a mensagem:**

```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api
```

### **Terminal 2 - Frontend (opcional):**

```bash
cd frontend
npm run web
# ou
npm run android  # Para Android
npm run ios      # Para iOS
```

## 📊 **6. Popular o Banco com Dados de Teste**

### **Método 1 - Via API:**

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/seed/database" -Method POST

# ou curl (Linux/Mac)
curl -X POST http://localhost:3000/seed/database
```

### **Método 2 - Via Swagger:**

1. Acesse: http://localhost:3000/api
2. Procure por "Seed"
3. Execute `POST /seed/database`

## 🧪 **7. Testar o Sistema**

### **Endpoints Principais:**

#### **1. Health Check:**

```bash
GET http://localhost:3000/health
```

#### **2. Feed de Posts:**

```bash
GET http://localhost:3000/posts/feed/timeline?page=1&limit=10
```

#### **3. Usuários:**

```bash
GET http://localhost:3000/users?page=1&limit=10
```

#### **4. Restaurantes:**

```bash
GET http://localhost:3000/restaurants?page=1&limit=10
```

### **Autenticação para Testes:**

1. **Registrar usuário:**

   ```bash
   POST http://localhost:3000/auth/register
   {
     "username": "testuser",
     "email": "test@example.com",
     "name": "Test User",
     "password": "password123"
   }
   ```

2. **Login:**

   ```bash
   POST http://localhost:3000/auth/login
   {
     "username": "testuser",
     "password": "password123"
   }
   ```

3. **Use o token retornado no header:**
   ```
   Authorization: Bearer SEU_TOKEN_AQUI
   ```

## 📱 **8. Acessar Interfaces**

### **URLs Importantes:**

- 🌐 **API Backend:** http://localhost:3000
- 📚 **Swagger Docs:** http://localhost:3000/api
- 📱 **Frontend Web:** http://localhost:8081 (Expo)
- ❤️ **Health Check:** http://localhost:3000/health

## 🛠️ **9. Comandos Úteis**

### **Backend:**

```bash
# Reiniciar migrations (CUIDADO - apaga dados)
npx prisma migrate reset

# Ver banco de dados
npx prisma studio

# Logs do backend
npm run start:dev

# Build para produção
npm run build
```

### **Frontend:**

```bash
# Limpar cache
npm run clear

# Ver dispositivos conectados
npm run android -- --list-devices

# Build para produção
npm run build:web
```

## 🐛 **10. Troubleshooting**

### **Problema: Erro de conexão com banco**

```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # Mac
```

### **Problema: Porta 3000 ocupada**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### **Problema: Dependências desatualizadas**

```bash
# Backend
cd backend && npm update

# Frontend
cd frontend && npm update
```

## 🎯 **11. Dados de Teste Gerados**

Após executar o seed, você terá:

- **20 usuários** com perfis realísticos
- **50 restaurantes** de diferentes culinárias
- **300 posts** com conteúdo autêntico
- **Likes e comentários** simulando engajamento real

### **Usuário de teste padrão:**

- **Username:** Qualquer um dos usuários gerados
- **Password:** `password123` (para todos os usuários fictícios)

## 🚀 **12. Próximos Passos**

Após o sistema rodar:

1. ✅ Explore a API via Swagger
2. ✅ Teste o feed de posts
3. ✅ Implemente métricas e analytics
4. ✅ Configure WhatsApp Bot
5. ✅ Implemente busca semântica

---

## 📞 **Suporte**

Se encontrar problemas:

1. Verifique os logs do backend
2. Consulte a documentação do Swagger
3. Verifique se todas as dependências estão instaladas
4. Confirme que PostgreSQL está rodando

**🎉 Bom desenvolvimento!**
