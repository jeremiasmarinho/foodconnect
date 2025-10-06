# FoodConnect - Setup no Debian Linux

Este guia te ajudará a configurar o projeto FoodConnect no seu ambiente Debian.

## 📋 Pré-requisitos

### 1. Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Git

```bash
sudo apt install git -y
git --version
```

### 3. Instalar Node.js (versão LTS)

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 4. Instalar ferramentas de desenvolvimento

```bash
# Compiladores necessários para algumas dependências
sudo apt install build-essential python3-dev -y

# VS Code (opcional mas recomendado)
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code -y
```

## 🚀 Configuração do Projeto

### 1. Clonar o repositório

```bash
# Navegar para o diretório desejado (ex: ~/Projects)
mkdir -p ~/Projects
cd ~/Projects

# Clonar o repositório
git clone https://github.com/jeremiasmarinho/foodconnect.git
cd foodconnect
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar variáveis de ambiente se necessário
nano .env
```

### 3. Configurar o Banco de Dados

```bash
# Remover arquivos do Windows (se existirem)
rm -f dev.db*
rm -rf prisma/migrations

# Aplicar schema do banco
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# (Opcional) Popular com dados de teste
npx prisma db seed
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run start:dev
```

O servidor estará rodando em: http://localhost:3000

### 5. Testar as APIs

```bash
# Tornar os scripts de teste executáveis
chmod +x test-follow-system.sh

# Executar testes
./test-follow-system.sh
```

## 🔧 Comandos Úteis

### Banco de Dados

```bash
# Ver banco no Prisma Studio
npx prisma studio

# Reset do banco (cuidado! apaga todos os dados)
npx prisma migrate reset

# Nova migração
npx prisma migrate dev --name "nome_da_migracao"
```

### Desenvolvimento

```bash
# Iniciar em modo watch
npm run start:dev

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Build para produção
npm run build
```

## 🎯 Estado Atual do Projeto

### ✅ Funcionalidades Implementadas

- ✅ Sistema de Autenticação (JWT)
- ✅ Sistema de Posts com imagens
- ✅ Sistema de Seguir Usuários (completo)
- ✅ Feed personalizado baseado em usuários seguidos
- ✅ Perfil de usuário com estatísticas

### 🚧 Em Desenvolvimento

- 🔄 Sistema de Conquistas/Badges
- 🔄 Sistema de Favoritos de Restaurantes
- 🔄 Perfil de usuário completo

### 📋 Próximos Passos

1. Sistema de Notificações
2. Busca Inteligente
3. Sistema de Avaliações
4. Interface Mobile-First
5. Onboarding e Tutorial

## 🐛 Problemas Conhecidos

### Erro do Prisma Client

Se você encontrar erros relacionados ao Prisma Client, execute:

```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Permissões no Linux

Se encontrar problemas de permissão:

```bash
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ./node_modules
```

## 📱 Configuração do Frontend (Futuro)

O frontend será desenvolvido em React Native/Expo:

```bash
# Instalar Expo CLI
npm install -g @expo/cli

# No diretório do projeto
cd ..
npx create-expo-app frontend --template blank-typescript
```

## 📞 Suporte

- Repositório: https://github.com/jeremiasmarinho/foodconnect
- Issues: https://github.com/jeremiasmarinho/foodconnect/issues

## 🎉 Pronto!

Seu ambiente de desenvolvimento está configurado. Você pode continuar o desenvolvimento das funcionalidades pendentes:

1. **Sistema de Favoritos** - Favoritar restaurantes
2. **Sistema de Notificações** - Notificações em tempo real
3. **Interface Mobile-First** - UI otimizada para mobile

Boa codificação! 🚀
