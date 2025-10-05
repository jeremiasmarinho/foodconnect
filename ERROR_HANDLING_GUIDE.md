# Sistema de Tratamento de Erros - FoodConnect

Este documento descreve a implementação completa do sistema de tratamento de erros robusto no projeto FoodConnect.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Frontend - React Native](#frontend---react-native)
- [Backend - NestJS](#backend---nestjs)
- [Exemplos de Uso](#exemplos-de-uso)
- [Configuração](#configuração)
- [Testes](#testes)

## 🎯 Visão Geral

O sistema de tratamento de erros implementa uma arquitetura abrangente que inclui:

- **Error Boundaries** para capturar erros de componentes React Native
- **Interceptors HTTP** para tratamento automático de erros de API
- **Context API** para gerenciamento global de erros
- **Feedback visual** através de toasts personalizados
- **Middleware global** no backend para tratamento padronizado
- **Logging estruturado** para monitoramento e debugging

## 🔧 Frontend - React Native

### Error Boundary

O `ErrorBoundary` captura erros JavaScript não tratados em componentes React:

```tsx
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

// Uso básico
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Com handler personalizado
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.log('Erro capturado:', error);
    // Enviar para serviço de monitoramento
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### API Interceptors

Os interceptors tratam automaticamente erros de requisições HTTP:

```tsx
import api from "../services/api/interceptors";

// As requisições são automaticamente interceptadas
try {
  const response = await api.get("/users");
  // Sucesso
} catch (error) {
  // Erro já foi tratado pelo interceptor
  // Apenas lide com lógica específica se necessário
}
```

### Error Context

O contexto global permite mostrar feedbacks visuais em qualquer lugar da aplicação:

```tsx
import { useErrorContext } from '../contexts/ErrorContext';

const MyComponent = () => {
  const { showError, showSuccess, showWarning, showInfo } = useErrorContext();

  const handleAction = async () => {
    try {
      await api.post('/action');
      showSuccess('Ação realizada com sucesso!');
    } catch (error) {
      showError(error, () => handleAction()); // Com retry
    }
  };

  return (
    // Seu componente
  );
};
```

### Configuração no App Root

Configure o sistema no componente raiz da aplicação:

```tsx
import { ErrorProvider } from "./src/contexts/ErrorContext";
import ErrorBoundary from "./src/components/ErrorBoundary/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <YourApp />
      </ErrorProvider>
    </ErrorBoundary>
  );
}
```

## 🔧 Backend - NestJS

### Global Exception Filter

O filtro global trata todas as exceções de forma padronizada:

```typescript
// Já configurado globalmente no AppModule
// Trata automaticamente:
// - HttpException (validação, autenticação, etc.)
// - PrismaClientKnownRequestError (erros de banco)
// - Erros genéricos com fallback apropriado
```

### Logging Interceptor

O interceptor de logging registra todas as requisições e respostas:

```typescript
// Já configurado globalmente no AppModule
// Registra automaticamente:
// - Requisições HTTP (método, URL, IP, user-agent)
// - Respostas (status, duração, dados em desenvolvimento)
// - Erros (stack trace, detalhes completos)
```

### Resposta Padronizada de Erro

Todas as respostas de erro seguem o formato:

```json
{
  "statusCode": 400,
  "timestamp": "2025-10-05T12:00:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "error": "Bad Request",
  "message": "Validation failed",
  "stack": "..." // Apenas em desenvolvimento
}
```

## 📱 Exemplos de Uso

### 1. Tratamento de Erro com Retry

```tsx
const { showError } = useErrorContext();

const fetchData = async () => {
  try {
    const data = await api.get("/data");
    return data;
  } catch (error) {
    showError(error, () => fetchData()); // Retry automático
    throw error;
  }
};
```

### 2. Validação de Formulário

```tsx
const handleSubmit = async (formData) => {
  try {
    await api.post("/users", formData);
    showSuccess("Usuário criado com sucesso!");
  } catch (error) {
    // Erros de validação (422) são tratados automaticamente
    // e mostrados como toast de erro
  }
};
```

### 3. Feedback Contextual

```tsx
const { showWarning, showInfo } = useErrorContext();

const handleDelete = () => {
  showWarning("Esta ação não pode ser desfeita.");
};

const handleSessionExpiry = () => {
  showInfo("Sua sessão expira em 5 minutos.");
};
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Backend
NODE_ENV=development # ou production
LOG_LEVEL=debug # error, warn, info, debug

# Frontend
REACT_APP_API_URL=http://localhost:3000
```

### Customização de Cores

Edite `src/styles/colors.ts` para personalizar as cores dos feedbacks:

```typescript
export const colors = {
  error: "#E74C3C",
  warning: "#F39C12",
  success: "#27AE60",
  info: "#3498DB",
  // ...
};
```

### Timeout de Requisições

Configure o timeout das requisições em `src/services/api/interceptors.ts`:

```typescript
const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000, // 10 segundos
});
```

## 🧪 Testes

### Testando Error Boundary

```tsx
import { render, screen } from "@testing-library/react-native";
import ErrorBoundary from "../ErrorBoundary";

const ThrowError = () => {
  throw new Error("Test error");
};

test("should catch and display error", () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText("Oops! Algo deu errado")).toBeTruthy();
});
```

### Testando Error Context

```tsx
import { renderHook, act } from "@testing-library/react-hooks";
import { useErrorContext } from "../ErrorContext";

test("should show error toast", () => {
  const { result } = renderHook(() => useErrorContext(), {
    wrapper: ErrorProvider,
  });

  act(() => {
    result.current.showError(new Error("Test error"));
  });

  // Verificar se o toast foi exibido
});
```

### Testando API Interceptors

```tsx
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import api from "../interceptors";

const mock = new MockAdapter(api);

test("should handle 404 error", async () => {
  mock.onGet("/test").reply(404);

  try {
    await api.get("/test");
  } catch (error) {
    expect(error.response.status).toBe(404);
  }
});
```

## 🚀 Monitoramento

### Logs Estruturados

O sistema gera logs estruturados para facilitar o monitoramento:

```
[LoggingInterceptor] ➡️  GET /api/users - 192.168.1.1 - Mozilla/5.0...
[LoggingInterceptor] ⬅️  GET /api/users - 200 - 45ms
[GlobalExceptionFilter] ❌ POST /api/users - 400 - Validation failed
```

### Integração com Serviços de Monitoramento

Para integrar com serviços como Sentry, adicione no Error Boundary:

```tsx
import * as Sentry from '@sentry/react-native';

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

## 📚 Referências

- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)

---

**Desenvolvido com ❤️ para o projeto FoodConnect**
