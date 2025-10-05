# Sistema de Validação de Dados - FoodConnect

Este documento descreve a implementação completa do sistema de validação de dados tanto no frontend (React Native) quanto no backend (NestJS).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Frontend - React Native](#frontend---react-native)
- [Backend - NestJS](#backend---nestjs)
- [Validadores Customizados](#validadores-customizados)
- [Máscaras e Formatação](#máscaras-e-formatação)
- [Exemplos de Uso](#exemplos-de-uso)
- [Testes](#testes)

## 🎯 Visão Geral

O sistema de validação implementa uma arquitetura robusta que inclui:

- **Validação client-side** com Formik e Yup no React Native
- **Validação server-side** com class-validator no NestJS
- **Máscaras de entrada** para CPF, telefone, CEP, etc.
- **Sanitização de dados** automática
- **Mensagens de erro** em português
- **Validadores customizados** para regras específicas do Brasil

## 🔧 Frontend - React Native

### Schemas de Validação (Yup)

O arquivo `src/utils/validation/schemas.ts` contém schemas reutilizáveis:

```typescript
import {
  authSchemas,
  userSchemas,
  restaurantSchemas,
} from "../utils/validation/schemas";

// Exemplo de uso
const loginSchema = authSchemas.login;
const registerSchema = authSchemas.register;
```

#### Schemas Disponíveis:

**authSchemas:**

- `login` - Email e senha para login
- `register` - Dados completos para registro
- `forgotPassword` - Email para recuperação
- `resetPassword` - Nova senha e confirmação

**userSchemas:**

- `profile` - Atualização de perfil do usuário
- `address` - Endereço de entrega

**restaurantSchemas:**

- `create` - Criação de restaurante
- `update` - Atualização de restaurante

**menuItemSchemas:**

- `create` - Criação de item do menu
- `update` - Atualização de item do menu

**orderSchemas:**

- `create` - Criação de pedido
- `update` - Atualização de status do pedido

### Componentes de Formulário

#### FormField

Componente de campo de entrada com validação integrada:

```tsx
import FormField from "../components/forms/FormField";

<FormField
  name="email"
  label="Email"
  placeholder="seu@email.com"
  keyboardType="email-address"
  required
  leftIcon={<Text>📧</Text>}
  mask={masks.email} // Opcional
/>;
```

**Props disponíveis:**

- `name` - Nome do campo (obrigatório)
- `label` - Label do campo
- `required` - Se é obrigatório
- `mask` - Função de máscara
- `leftIcon` / `rightIcon` - Ícones
- `helperText` - Texto de ajuda
- Todas as props do TextInput

#### FormButton

Botão otimizado para formulários:

```tsx
import FormButton from "../components/forms/FormButton";

<FormButton
  title="Entrar"
  loading={isSubmitting}
  disabled={!isValid}
  onPress={() => handleSubmit()}
  variant="primary" // primary, secondary, outline, danger
  size="medium" // small, medium, large
/>;
```

### Máscaras de Entrada

O arquivo `src/utils/validation/masks.ts` contém máscaras para diferentes tipos de dados:

```typescript
import { masks } from "../utils/validation/masks";

// Aplicar máscara
const cpfMasked = masks.cpf("12345678901"); // 123.456.789-01
const phoneMasked = masks.phone("11999999999"); // (11) 99999-9999
const cepMasked = masks.cep("01234567"); // 01234-567

// Remover máscara
const cpfClean = unmasks.cpf("123.456.789-01"); // 12345678901
```

**Máscaras disponíveis:**

- `cpf` - CPF brasileiro
- `phone` - Telefone brasileiro
- `cep` - CEP brasileiro
- `currency` - Moeda (R$)
- `creditCard` - Cartão de crédito
- `date` - Data (DD/MM/YYYY)
- `time` - Hora (HH:MM)
- `numeric` - Apenas números
- `alphabetic` - Apenas letras
- `alphanumeric` - Letras e números

### Exemplo de Formulário Completo

```tsx
import React from "react";
import { Formik } from "formik";
import { authSchemas } from "../utils/validation/schemas";
import FormField from "../components/forms/FormField";
import FormButton from "../components/forms/FormButton";

const LoginForm = () => {
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={authSchemas.login}
      onSubmit={handleLogin}
    >
      {({ handleSubmit, isSubmitting, isValid }) => (
        <View>
          <FormField
            name="email"
            label="Email"
            keyboardType="email-address"
            required
          />

          <FormField name="password" label="Senha" secureTextEntry required />

          <FormButton
            title="Entrar"
            loading={isSubmitting}
            disabled={!isValid}
            onPress={() => handleSubmit()}
          />
        </View>
      )}
    </Formik>
  );
};
```

## 🔧 Backend - NestJS

### Validadores Customizados

O arquivo `backend/src/common/validators/custom-validators.ts` contém validadores específicos:

```typescript
import {
  IsCPF,
  IsPhone,
  IsStrongPassword,
  IsPrice,
} from "../validators/custom-validators";

export class CreateUserDto {
  @IsCPF({ message: "CPF deve ter um formato válido" })
  cpf: string;

  @IsPhone({ message: "Telefone deve ter um formato válido" })
  phone: string;

  @IsStrongPassword({ message: "Senha deve ser forte" })
  password: string;

  @IsPrice({ message: "Preço deve ser válido" })
  price: number;
}
```

**Validadores disponíveis:**

- `@IsCPF()` - Valida CPF brasileiro
- `@IsPhone()` - Valida telefone brasileiro
- `@IsCEP()` - Valida CEP brasileiro
- `@IsStrongPassword()` - Valida senha forte
- `@IsPrice()` - Valida preço com 2 casas decimais

### DTO com Validação e Sanitização

```typescript
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Email deve ter um formato válido" })
  @IsNotEmpty({ message: "Email é obrigatório" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toLowerCase().trim() : value
  )
  email: string;

  @IsNotEmpty({ message: "Nome é obrigatório" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value
  )
  name: string;

  @IsPhone({ message: "Telefone deve ter um formato válido" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.replace(/[^\d]/g, "") : value
  )
  phone: string;

  @IsStrongPassword()
  password: string;
}
```

### Configuração Global

Para habilitar validação automática, configure no `main.ts`:

```typescript
import { ValidationPipe } from "@nestjs/common";

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Rejeita propriedades extras
    transform: true, // Aplica transformações automáticas
    transformOptions: {
      enableImplicitConversion: true, // Conversão automática de tipos
    },
  })
);
```

## 🧪 Testes

### Testes de Validação Frontend

```typescript
import { validateForm } from "../utils/validation/schemas";
import { authSchemas } from "../utils/validation/schemas";

describe("Form Validation", () => {
  it("should validate correct data", async () => {
    const data = {
      email: "test@example.com",
      password: "StrongPass123",
    };

    const result = await validateForm(authSchemas.login, data);
    expect(result.isValid).toBe(true);
  });

  it("should reject invalid email", async () => {
    const data = {
      email: "invalid-email",
      password: "StrongPass123",
    };

    const result = await validateForm(authSchemas.login, data);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });
});
```

### Testes de Validação Backend

```typescript
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { RegisterDto } from "../auth/dto/auth.dto";

describe("DTO Validation", () => {
  it("should validate correct registration data", async () => {
    const dto = plainToClass(RegisterDto, {
      name: "João Silva",
      email: "joao@exemplo.com",
      phone: "11999999999",
      password: "MinhaSenh@123",
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
```

## 🎨 Personalização

### Mensagens de Erro Customizadas

```typescript
// Frontend
const customSchemas = {
  email: Yup.string()
    .email('Por favor, insira um email válido')
    .required('Email é obrigatório'),
};

// Backend
@IsEmail({}, { message: 'Email deve ter formato válido' })
email: string;
```

### Validadores Personalizados

```typescript
// Frontend (Yup)
const customValidator = Yup.string().test(
  "custom-validation",
  "Mensagem de erro personalizada",
  (value) => {
    // Sua lógica de validação
    return value === "esperado";
  }
);

// Backend (class-validator)
@ValidatorConstraint({ name: "customValidator", async: false })
export class CustomValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    // Sua lógica de validação
    return value === "esperado";
  }

  defaultMessage(): string {
    return "Mensagem de erro personalizada";
  }
}
```

## 🚀 Próximos Passos

1. **Validação Assíncrona** - Verificar unicidade de email/username
2. **Rate Limiting** - Limitar tentativas de validação
3. **Sanitização Avançada** - Proteção contra XSS/injection
4. **Logs de Validação** - Monitorar tentativas de dados inválidos
5. **Cache de Validação** - Otimizar performance

## 📚 Referências

- [Formik Documentation](https://formik.org/docs/overview)
- [Yup Schema Validation](https://github.com/jquense/yup)
- [Class Validator](https://github.com/typestack/class-validator)
- [Class Transformer](https://github.com/typestack/class-transformer)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

---

**Sistema implementado com ❤️ para garantir qualidade e segurança dos dados do FoodConnect**
