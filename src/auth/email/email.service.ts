import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async enviarToken(email: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Código de Confirmación de Pago',
      text: `Tu código de confirmación es:`,
      html: `<p>Tu código de confirmación es: <strong>${token}</strong></p>`,
    });
  }
}
