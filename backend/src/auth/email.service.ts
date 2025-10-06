import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send email verification token
   */
  async sendEmailVerification(email: string, token: string, name: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B6B;">Bem-vindo ao FoodConnect! 🍽️</h2>
        <p>Olá, <strong>${name}</strong>!</p>
        <p>Obrigado por se cadastrar no FoodConnect. Para completar seu cadastro, por favor verifique seu email clicando no botão abaixo:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verificar Email
          </a>
        </div>
        
        <p>Ou copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Este link expira em 24 horas. Se você não se cadastrou no FoodConnect, pode ignorar este email.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          FoodConnect - Conectando amantes da comida, uma refeição de cada vez!
        </p>
      </div>
    `;

    const text = `
      Bem-vindo ao FoodConnect!
      
      Olá, ${name}!
      
      Para verificar seu email, acesse: ${verificationUrl}
      
      Este link expira em 24 horas.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verificação de Email - FoodConnect',
      html,
      text,
    });
  }

  /**
   * Send password reset token
   */
  async sendPasswordReset(email: string, token: string, name: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B6B;">Redefinir Senha - FoodConnect 🔒</h2>
        <p>Olá, <strong>${name}</strong>!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no FoodConnect.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        
        <p>Ou copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Este link expira em 1 hora. Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          FoodConnect - Conectando amantes da comida, uma refeição de cada vez!
        </p>
      </div>
    `;

    const text = `
      Redefinir Senha - FoodConnect
      
      Olá, ${name}!
      
      Para redefinir sua senha, acesse: ${resetUrl}
      
      Este link expira em 1 hora.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Redefinir Senha - FoodConnect',
      html,
      text,
    });
  }

  /**
   * Send email using configured provider
   * In production, this would integrate with services like:
   * - SendGrid
   * - AWS SES
   * - Nodemailer with SMTP
   */
  private async sendEmail(options: EmailOptions) {
    const { to, subject, html, text } = options;

    // For development, just log the email
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.logger.log('Email would be sent:', {
        to,
        subject,
        htmlLength: html.length,
        textLength: text?.length || 0,
      });

      // In development, you could save to a file or use a service like Mailtrap
      this.logger.debug('Email HTML content:', html);
      return;
    }

    // Production email sending would go here
    // Example with nodemailer:
    /*
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your SMTP config
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to,
      subject,
      html,
      text,
    });
    */

    this.logger.log('Email sent successfully', { to, subject });
  }
}
