# 🔧 Quick Fix Guide - Common ESLint Errors

## 📋 Erros Mais Comuns Detectados

### 1. 🚨 **Unsafe member access on `any` value**

**Problema:** Acessar propriedades de objetos tipados como `any`

```typescript
// ❌ Erro
const user = req.user; // any
const userId = user.id; // Unsafe member access
```

**Solução:** Tipar corretamente

```typescript
// ✅ Correto
interface AuthRequest extends Request {
  user: { id: string; email: string };
}

const user = (req as AuthRequest).user;
const userId = user.id; // Type-safe
```

### 2. 🚨 **Unused variables in tests**

**Problema:** Variáveis declaradas mas não usadas

```typescript
// ❌ Erro
const prismaService = { ... }; // unused
```

**Solução:** Remover ou usar underscore

```typescript
// ✅ Correto
const _prismaService = { ... }; // Indica intencionalmente não usado
// ou simplesmente remover se não precisar
```

### 3. 🚨 **Unbound method references**

**Problema:** Métodos sendo passados sem bind

```typescript
// ❌ Erro
expect(mockService.create).toHaveBeenCalled();
```

**Solução:** Usar arrow function ou bind

```typescript
// ✅ Correto
expect(mockService.create).toHaveBeenCalledWith(expect.any(Object));
// ou
jest.spyOn(mockService, "create");
```

## 🛠️ Fix Rápido - Comandos Úteis

### Correção Automática (quando possível):

```bash
cd backend
npm run lint -- --fix
```

### Verificação de Tipos:

```bash
cd backend
npx tsc --noEmit
```

### Executar Testes Após Correções:

```bash
cd backend
npm run test
```

## 📝 Padrão de Tipagem para Request Objects

Crie um arquivo `src/types/express.d.ts`:

```typescript
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

## 🔧 ESLint Overrides para Testes

Se necessário, adicione ao `.eslintrc.js`:

```javascript
module.exports = {
  // ... existing config
  overrides: [
    {
      files: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
      rules: {
        "@typescript-eslint/no-unused-vars": "warn", // Menos rigoroso em testes
        "@typescript-eslint/no-unsafe-member-access": "warn",
      },
    },
  ],
};
```

## ⚡ Comandos de Desenvolvimento

```bash
# Verificar qualidade antes de commit
npm run ci:quality

# Executar todos os testes
npm run ci:test

# Pipeline completo local
npm run ci:all
```

---

💡 **Dica:** Execute `npm run ci:quality` antes de cada commit para garantir que o CI passará!
