# 🚀 FoodConnect CI/CD Pipeline

Este diretório contém toda a configuração de **Integração Contínua** e **Deploy Contínuo** do projeto FoodConnect.

## 📋 Workflows Disponíveis

### 🔄 `ci-cd.yml` - Pipeline Principal

**Triggers:** Push e Pull Requests para `main` e `develop`

**Jobs:**

- **🔍 Quality Check** - Linting, TypeScript, build verification
- **🧪 Backend Tests** - Unit tests, E2E tests com PostgreSQL
- **🧪 Frontend Tests** - Component tests, build verification
- **🔗 Integration Check** - Verificação final de deploy
- **🔒 Security Scan** - Audit de dependências, análise de bundle

### 🚦 `pr-quality.yml` - Review Automático de PRs

**Triggers:** Pull Requests (opened, synchronize, reopened)

**Funcionalidades:**

- ✅ Testes rápidos apenas nos arquivos modificados
- 📊 Análise de tamanho do PR
- 🔒 Verificação de segurança
- 💬 Comentários automáticos com status

### 🚀 `release.yml` - Pipeline de Release

**Triggers:** Tags de versão (`v*.*.*`)

**Funcionalidades:**

- 📦 Criação automática de releases no GitHub
- 📝 Geração de changelog baseado em commits
- 🏗️ Build final de produção
- 📊 Estatísticas do release

## 🛠️ Configuração Local

### Scripts Disponíveis

**Root do projeto:**

```bash
npm run install:all    # Instalar dependências de todos os projetos
npm run ci:all         # Executar todos os checks de CI localmente
npm run test:all       # Executar todos os testes
npm run lint:all       # Executar linting em todos os projetos
npm run build:all      # Build de todos os projetos
```

**Backend específico:**

```bash
cd backend
npm run ci:all         # Quality + Tests completos
npm run ci:quality     # Apenas linting + build
npm run ci:test        # Apenas testes (unit + E2E)
```

**Frontend específico:**

```bash
cd frontend
npm run ci:all         # Quality + Tests completos
npm run ci:test        # Testes com coverage
```

## 🔧 Configuração de Environment

### Variáveis de Ambiente Necessárias

**Para PostgreSQL (testes):**

```env
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/foodconnect_test
JWT_SECRET=test-secret-key-for-ci
NODE_ENV=test
```

### Secrets do GitHub (configurar no repositório)

1. **`GITHUB_TOKEN`** - Automático, usado para releases
2. **`CODECOV_TOKEN`** - (Opcional) Para upload de coverage

## 📊 Quality Gates

### ❌ PR será rejeitado se:

- Testes falharem
- Linting falhar
- Build falhar
- Vulnerabilidades críticas detectadas

### ✅ PR será aprovado se:

- Todos os testes passarem
- Code quality OK
- Build successful
- Security scan limpo

## 🚦 Branch Protection Rules

### Branch `main`:

- ✅ Require PR reviews (1 mínimo)
- ✅ Require status checks:
  - `quality-check`
  - `backend-tests`
  - `frontend-tests`
- ✅ Require up-to-date branches
- ✅ Include administrators

### Branch `develop`:

- ✅ Require status checks
- ✅ Allow force pushes (para development)

## 🏷️ Versionamento e Releases

### Criando uma Release:

1. **Commit suas mudanças**
2. **Criar tag de versão:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. **GitHub Actions cria automaticamente:**
   - 📦 Release no GitHub
   - 📝 Changelog gerado
   - 🏗️ Builds finais

### Convenção de Versioning:

- `v1.0.0` - Release major
- `v1.1.0` - Release minor
- `v1.1.1` - Patch release
- `v1.0.0-beta.1` - Pre-release

## 🤖 Dependabot

Configurado para atualizar dependências automaticamente:

- **📅 Schedule:** Segundas-feiras 09:00
- **📦 Scope:** npm (backend/frontend), GitHub Actions
- **🔒 Security:** Apenas patches e minor updates
- **👥 Reviewer:** @jeremiasmarinho

## 🐛 Troubleshooting

### Testes falhando no CI mas passando localmente:

1. **Verificar variáveis de ambiente**
2. **Verificar versão do Node.js (deve ser 18.x)**
3. **Limpar cache:** `npm ci` ao invés de `npm install`

### Build falhando:

1. **Verificar se todos os tipos TypeScript estão corretos**
2. **Verificar se não há imports relativos quebrados**
3. **Verificar se todas as dependências estão no package.json**

### E2E tests timeout:

1. **Verificar se o PostgreSQL está rodando**
2. **Verificar se as migrations foram aplicadas**
3. **Verificar se o servidor iniciou corretamente**

## 📚 Recursos Adicionais

- 📋 [Issue Templates](./.github/ISSUE_TEMPLATE/)
- 📝 [PR Template](./.github/pull_request_template.md)
- 🤖 [Dependabot Config](./.github/dependabot.yml)
- 🔧 [Workflow Examples](./workflows/)

---

## 🎯 Próximos Passos

- [ ] Configurar deploy automático para staging
- [ ] Integrar com Sentry para error tracking
- [ ] Adicionar performance benchmarks
- [ ] Configurar rollback automático
- [ ] Integrar com Slack/Discord para notificações

---

💡 **Dica:** Execute `npm run ci:all` antes de fazer push para garantir que tudo passará no CI!
