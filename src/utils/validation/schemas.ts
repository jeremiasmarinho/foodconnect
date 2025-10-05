import * as Yup from "yup";

// Validation messages in Portuguese
const messages = {
  required: "Este campo é obrigatório",
  email: "Email deve ter um formato válido",
  min: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  max: (max: number) => `Deve ter no máximo ${max} caracteres`,
  minValue: (min: number) => `Deve ser pelo menos ${min}`,
  maxValue: (max: number) => `Deve ser no máximo ${max}`,
  positive: "Deve ser um número positivo",
  integer: "Deve ser um número inteiro",
  phone: "Telefone deve ter um formato válido",
  password:
    "Senha deve conter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número",
  confirmPassword: "Confirmação de senha deve coincidir com a senha",
  cpf: "CPF deve ter um formato válido",
  cep: "CEP deve ter um formato válido",
};

// Custom validation functions
const validateCPF = (cpf: string | undefined): boolean => {
  if (!cpf) return false;

  const cleanCPF = cpf.replace(/[^\d]/g, "");
  if (cleanCPF.length !== 11) return false;

  // Check for repeated digits
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};

const validateCEP = (cep: string | undefined): boolean => {
  if (!cep) return false;
  const cleanCEP = cep.replace(/[^\d]/g, "");
  return cleanCEP.length === 8;
};

const validatePhone = (phone: string | undefined): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

const validatePassword = (password: string | undefined): boolean => {
  if (!password) return false;

  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Common field schemas
export const commonSchemas = {
  email: Yup.string().email(messages.email).required(messages.required),

  password: Yup.string()
    .min(8, messages.min(8))
    .test("password-strength", messages.password, validatePassword)
    .required(messages.required),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], messages.confirmPassword)
    .required(messages.required),

  name: Yup.string()
    .min(2, messages.min(2))
    .max(100, messages.max(100))
    .required(messages.required),

  phone: Yup.string()
    .test("phone-format", messages.phone, validatePhone)
    .required(messages.required),

  cpf: Yup.string()
    .test("cpf-format", messages.cpf, validateCPF)
    .required(messages.required),

  cep: Yup.string()
    .test("cep-format", messages.cep, validateCEP)
    .required(messages.required),

  address: Yup.string()
    .min(10, messages.min(10))
    .max(200, messages.max(200))
    .required(messages.required),

  price: Yup.number().positive(messages.positive).required(messages.required),

  quantity: Yup.number()
    .integer(messages.integer)
    .min(1, messages.minValue(1))
    .required(messages.required),

  description: Yup.string()
    .min(10, messages.min(10))
    .max(500, messages.max(500))
    .required(messages.required),

  title: Yup.string()
    .min(3, messages.min(3))
    .max(100, messages.max(100))
    .required(messages.required),

  optional: {
    email: Yup.string().email(messages.email).nullable(),
    phone: Yup.string()
      .test(
        "phone-format",
        messages.phone,
        (value) => !value || validatePhone(value)
      )
      .nullable(),
    description: Yup.string().max(500, messages.max(500)).nullable(),
    notes: Yup.string().max(200, messages.max(200)).nullable(),
  },
};

// Form schemas
export const authSchemas = {
  login: Yup.object({
    email: commonSchemas.email,
    password: Yup.string().required(messages.required), // Less strict for login
  }),

  register: Yup.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: commonSchemas.confirmPassword,
    phone: commonSchemas.phone,
  }),

  forgotPassword: Yup.object({
    email: commonSchemas.email,
  }),

  resetPassword: Yup.object({
    password: commonSchemas.password,
    confirmPassword: commonSchemas.confirmPassword,
  }),
};

export const userSchemas = {
  profile: Yup.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    cpf: commonSchemas.optional.email, // Optional for updates
  }),

  address: Yup.object({
    street: commonSchemas.address,
    number: Yup.string().required(messages.required),
    complement: Yup.string().nullable(),
    neighborhood: Yup.string().required(messages.required),
    city: Yup.string().required(messages.required),
    state: Yup.string().required(messages.required),
    cep: commonSchemas.cep,
  }),
};

export const restaurantSchemas = {
  create: Yup.object({
    name: commonSchemas.title,
    description: commonSchemas.description,
    phone: commonSchemas.phone,
    email: commonSchemas.optional.email,
    address: commonSchemas.address,
    cuisine: Yup.string().required(messages.required),
    priceRange: Yup.string()
      .oneOf(["$", "$$", "$$$"], "Faixa de preço inválida")
      .required(messages.required),
  }),

  update: Yup.object({
    name: commonSchemas.title,
    description: commonSchemas.description,
    phone: commonSchemas.phone,
    email: commonSchemas.optional.email,
    address: commonSchemas.address,
    cuisine: Yup.string().required(messages.required),
    priceRange: Yup.string()
      .oneOf(["$", "$$", "$$$"], "Faixa de preço inválida")
      .required(messages.required),
    isOpen: Yup.boolean(),
  }),
};

export const menuItemSchemas = {
  create: Yup.object({
    name: commonSchemas.title,
    description: commonSchemas.description,
    price: commonSchemas.price,
    category: Yup.string().required(messages.required),
    imageUrl: Yup.string().url("URL deve ser válida").nullable(),
    isAvailable: Yup.boolean(),
    preparationTime: Yup.number()
      .integer(messages.integer)
      .min(1, messages.minValue(1)),
  }),

  update: Yup.object({
    name: commonSchemas.title,
    description: commonSchemas.description,
    price: commonSchemas.price,
    category: Yup.string().required(messages.required),
    imageUrl: Yup.string().url("URL deve ser válida").nullable(),
    isAvailable: Yup.boolean(),
    preparationTime: Yup.number()
      .integer(messages.integer)
      .min(1, messages.minValue(1)),
  }),
};

export const orderSchemas = {
  create: Yup.object({
    restaurantId: Yup.string().required(messages.required),
    deliveryAddress: commonSchemas.address,
    notes: commonSchemas.optional.notes,
    orderItems: Yup.array()
      .of(
        Yup.object({
          menuItemId: Yup.string().required(messages.required),
          quantity: commonSchemas.quantity,
          notes: commonSchemas.optional.notes,
        })
      )
      .min(1, "Pedido deve ter pelo menos um item")
      .required(messages.required),
  }),

  update: Yup.object({
    status: Yup.string()
      .oneOf(
        [
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "delivered",
          "cancelled",
        ],
        "Status inválido"
      )
      .required(messages.required),
    estimatedTime: Yup.string().nullable(),
    notes: commonSchemas.optional.notes,
  }),
};

// Utility functions for form handling
export const getFieldError = (
  errors: any,
  touched: any,
  fieldName: string
): string | undefined => {
  const fieldParts = fieldName.split(".");
  let error = errors;
  let touch = touched;

  for (const part of fieldParts) {
    error = error?.[part];
    touch = touch?.[part];
  }

  return touch && error ? error : undefined;
};

export const hasFieldError = (
  errors: any,
  touched: any,
  fieldName: string
): boolean => {
  return !!getFieldError(errors, touched, fieldName);
};

// Form validation helpers
export const validateField = async (
  schema: Yup.Schema,
  value: any
): Promise<string | null> => {
  try {
    await schema.validate(value);
    return null;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message;
    }
    return "Erro de validação";
  }
};

export const validateForm = async (
  schema: Yup.Schema,
  values: any
): Promise<{ isValid: boolean; errors: any }> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors = error.inner.reduce((acc, err) => {
        if (err.path) {
          acc[err.path] = err.message;
        }
        return acc;
      }, {} as any);

      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Erro de validação" } };
  }
};
