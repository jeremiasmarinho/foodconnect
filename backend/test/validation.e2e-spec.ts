import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RegisterDto, LoginDto } from '../src/auth/dto/auth.dto';

describe('Validation System', () => {
  describe('RegisterDto', () => {
    it('should validate a correct registration', async () => {
      const dto = plainToClass(RegisterDto, {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '(11) 99999-9999',
        password: 'MinhaSenh@123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email', async () => {
      const dto = plainToClass(RegisterDto, {
        name: 'João Silva',
        email: 'email-inválido',
        phone: '(11) 99999-9999',
        password: 'MinhaSenh@123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should reject weak password', async () => {
      const dto = plainToClass(RegisterDto, {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '(11) 99999-9999',
        password: '123', // Too weak
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordErrors = errors.find(
        (error) => error.property === 'password',
      );
      expect(passwordErrors).toBeDefined();
    });

    it('should reject invalid phone', async () => {
      const dto = plainToClass(RegisterDto, {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '123', // Too short
        password: 'MinhaSenh@123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const phoneErrors = errors.find((error) => error.property === 'phone');
      expect(phoneErrors).toBeDefined();
    });

    it('should reject empty name', async () => {
      const dto = plainToClass(RegisterDto, {
        name: '',
        email: 'joao@exemplo.com',
        phone: '(11) 99999-9999',
        password: 'MinhaSenh@123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find((error) => error.property === 'name');
      expect(nameErrors).toBeDefined();
    });

    it('should sanitize input data', async () => {
      const dto = plainToClass(RegisterDto, {
        name: '  João   Silva  ',
        email: '  JOAO@EXEMPLO.COM  ',
        phone: '(11) 99999-9999',
        password: 'MinhaSenh@123',
      });

      // Test transformations
      expect(dto.name).toBe('João Silva'); // Trimmed and normalized spaces
      expect(dto.email).toBe('joao@exemplo.com'); // Lowercase and trimmed
      expect(dto.phone).toBe('11999999999'); // Only digits
    });
  });

  describe('LoginDto', () => {
    it('should validate a correct login', async () => {
      const dto = plainToClass(LoginDto, {
        email: 'joao@exemplo.com',
        password: 'qualquersenha',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email', async () => {
      const dto = plainToClass(LoginDto, {
        email: 'email-inválido',
        password: 'qualquersenha',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should reject empty password', async () => {
      const dto = plainToClass(LoginDto, {
        email: 'joao@exemplo.com',
        password: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordErrors = errors.find(
        (error) => error.property === 'password',
      );
      expect(passwordErrors).toBeDefined();
    });
  });
});
