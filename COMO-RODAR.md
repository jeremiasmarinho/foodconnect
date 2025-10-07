# 🚀 Como Rodar o FoodConnect

## 📋 Resumo da Arquitetura

- **Backend**: NestJS + Prisma + SQLite (porta 3001)
- **Frontend**: React Native + Expo (porta 8081)
- **Documentação**: Swagger em http://localhost:3001/api

---

## ✅ Pré-requisitos

- Node.js 18.x ou 20.x
- npm ou yarn
- Expo CLI (opcional, já vem com expo)

---

## 🔧 Configuração Inicial (Primeira Vez)

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed  # Criar usuário admin
```

### 2. Frontend

```bash
cd frontend
npm install
```

---

## 🏃 Rodando o Projeto

### Terminal 1: Backend

```bash
cd backend
npm run start:dev
```

**Aguarde até ver:**

```
🚀 Application is running on: http://localhost:3001
📚 Swagger documentation: http://localhost:3001/api
```

### Terminal 2: Frontend

```bash
cd frontend
npm run web
```

**Aguarde até ver:**

```
Metro waiting on exp://localhost:8081
```

---

## 🌐 Acessando a Aplicação

- **Frontend Web**: http://localhost:8081
- **Backend API**: http://localhost:3001
- **Swagger/Docs**: http://localhost:3001/api
- **Banco SQLite**: `backend/prisma/dev.db`

---

## 🧪 Rodando Testes

### Backend

```bash
cd backend
npm test                # Testes unitários
npm run test:e2e        # Testes E2E
npm run test:all:cov    # Todos com cobertura
```

### Frontend

```bash
cd frontend
npm test                # Testes unitários
npm run typecheck       # Verificar tipos
npm run ci              # Typecheck + testes
```

---

## 📱 Rodando em Dispositivo Mobile

### Android

```bash
cd frontend
npm run android
```

### iOS (Mac apenas)

```bash
cd frontend
npm run ios
```

### Nota Importante para Mobile:

- O IP configurado é `192.168.0.161`
- Atualize em `frontend/src/config/api.ts` se seu IP for diferente
- Backend deve aceitar conexões de `0.0.0.0` (já configurado)

---

## 🔑 Credenciais Padrão

Criadas pelo seed (`npm run db:seed`):

- **Email**: admin@foodconnect.com
- **Senha**: FoodConnect2024!

---

## 🛠️ Comandos Úteis

### Backend

```bash
npx prisma studio          # Interface visual do banco
npx prisma migrate reset   # Resetar banco
npm run build              # Build de produção
```

### Frontend

```bash
npm run test:coverage      # Cobertura de testes
npm run build              # Build web
expo start --clear         # Limpar cache
```

---

## 🐛 Solução de Problemas

### Backend não inicia

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Frontend com erro de hooks do React

```bash
cd frontend
rm -rf node_modules package-lock.json .expo
npm install
```

### Porta já em uso

```bash
# Matar processo na porta 3001 (backend)
npx kill-port 3001

# Matar processo na porta 8081 (frontend)
npx kill-port 8081
```

### Cache do Expo

```bash
cd frontend
npx expo start --clear
```

---

## 📊 Status do Projeto

### ✅ Implementado

- Sistema de autenticação (JWT + refresh tokens)
- Posts com upload de imagens
- Sistema de seguir usuários
- Feed personalizado
- Restaurantes e Bares (Establishments)
- Marcação de amigos em fotos
- Stories (Instagram-like)
- Sistema de pedidos
- Notificações em tempo real

### 🚧 Em Desenvolvimento

- Sistema de conquistas
- Sistema de favoritos
- Interface mobile completa

---

## 🏗️ Estrutura de Pastas

```
foodconnect/
├── backend/
│   ├── src/
│   │   ├── auth/           # Autenticação JWT
│   │   ├── users/          # Gestão de usuários
│   │   ├── posts/          # Posts e interações
│   │   ├── restaurants/    # Estabelecimentos
│   │   ├── stories/        # Stories
│   │   ├── orders/         # Pedidos
│   │   ├── notifications/  # Notificações
│   │   └── prisma/         # Prisma service
│   └── prisma/
│       └── schema.prisma   # Schema do banco
│
└── frontend/
    ├── src/
    │   ├── components/     # Componentes reutilizáveis
    │   ├── screens/        # Telas da aplicação
    │   ├── navigation/     # Navegação
    │   ├── providers/      # Context providers
    │   ├── services/       # API services
    │   ├── hooks/          # Custom hooks
    │   └── types/          # TypeScript types
    └── App.tsx             # Entry point
```

---

## 🔄 Fluxo de Desenvolvimento

1. **Parou o app**: Ctrl+C nos dois terminais
2. **Religar backend**: `cd backend && npm run start:dev`
3. **Religar frontend**: `cd frontend && npm run web`
4. **Verificar saúde**: http://localhost:3001/api

---

## 📞 Suporte

- Documentação completa: `/docs` (no repositório)
- Swagger API: http://localhost:3001/api
- Issues: GitHub Issues do projeto
