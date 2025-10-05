import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// CPF Validator
@ValidatorConstraint({ name: 'isCPF', async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string): boolean {
    if (!cpf) return false;

    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]/g, '');

    // Check length
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
  }

  defaultMessage(): string {
    return 'CPF deve ter um formato válido';
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCPFConstraint,
    });
  };
}

// Phone Validator
@ValidatorConstraint({ name: 'isPhone', async: false })
export class IsPhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: string): boolean {
    if (!phone) return false;

    const cleanPhone = phone.replace(/[^\d]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  defaultMessage(): string {
    return 'Telefone deve ter um formato válido';
  }
}

export function IsPhone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneConstraint,
    });
  };
}

// CEP Validator
@ValidatorConstraint({ name: 'isCEP', async: false })
export class IsCEPConstraint implements ValidatorConstraintInterface {
  validate(cep: string): boolean {
    if (!cep) return false;

    const cleanCEP = cep.replace(/[^\d]/g, '');
    return cleanCEP.length === 8;
  }

  defaultMessage(): string {
    return 'CEP deve ter um formato válido';
  }
}

export function IsCEP(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCEPConstraint,
    });
  };
}

// Strong Password Validator
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string): boolean {
    if (!password) return false;

    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  defaultMessage(): string {
    return 'Senha deve conter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Price Validator (positive number with max 2 decimal places)
@ValidatorConstraint({ name: 'isPrice', async: false })
export class IsPriceConstraint implements ValidatorConstraintInterface {
  validate(price: number): boolean {
    if (typeof price !== 'number') return false;
    if (price <= 0) return false;

    // Check if has more than 2 decimal places
    const decimals = (price.toString().split('.')[1] || '').length;
    return decimals <= 2;
  }

  defaultMessage(): string {
    return 'Preço deve ser um número positivo com no máximo 2 casas decimais';
  }
}

export function IsPrice(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPriceConstraint,
    });
  };
}

// Sanitization helpers
export class SanitizationHelpers {
  static sanitizeCPF(cpf: string): string {
    return cpf.replace(/[^\d]/g, '');
  }

  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  }

  static sanitizeCEP(cep: string): string {
    return cep.replace(/[^\d]/g, '');
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static capitalizeWords(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
