# FoodConnect - Scripts de Gerenciamento

## Iniciar o Projeto

```bash
./start-all.sh
```

Este script irá:

- ✅ Instalar dependências (se necessário)
- ✅ Configurar o banco de dados Prisma
- ✅ Iniciar o backend (NestJS) na porta 3000
- ✅ Iniciar o frontend (Expo Web) na porta 8081

## Parar o Projeto

```bash
./stop-all.sh
```

## Acessar a Aplicação

- **Frontend Web**: http://localhost:8081
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api

## Logs

Ver logs em tempo real:

```bash
# Backend
tail -f backend.log

# Frontend
tail -f frontend.log
```

## Credenciais Padrão

- **Email**: admin@foodconnect.com
- **Senha**: admin123

## Comandos Individuais

### Backend apenas

```bash
cd backend
npm run start:dev
```

### Frontend apenas

```bash
cd frontend
npx expo start --web
```

### Prisma Studio (Gerenciar BD)

```bash
cd backend
npx prisma studio
```

## Troubleshooting

### Erro de porta em uso

```bash
# Encontrar processo usando a porta 3000
lsof -i :3000
# Matar o processo
kill -9 <PID>
```

### Limpar cache do Expo

```bash
cd frontend
npx expo start --clear
```

### Resetar banco de dados

```bash
cd backend
npx prisma migrate reset
```

### Recriar admin

```bash
cd backend
npx ts-node scripts/create-admin.ts
```
