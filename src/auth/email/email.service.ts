import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { IEmailBody } from './interface/email.interface';
import { EnvironmentService } from 'src/common/enviroment.config';

@Injectable()
export class EmailService {
  constructor(private environmentsService: EnvironmentService) {}
  async sendMail(dataEmailCloud: IEmailBody) {
    try {
      const { data } = await axios.post(
        this.environmentsService.mailUrl,
        dataEmailCloud,
      );
      return {
        err: false,
        data,
      };
    } catch (error: any) {
      console.log('Error in function: [sendEmails]', error);
      return {
        err: true,
        data: error,
      };
    }
  }

  async sendVerificationEmail(email: string, verificationCode: string) {
    try {
      const dataEmailUser: IEmailBody = {
        from: `Tu Billetera Virtual <${this.environmentsService.emailFrom}>`,
        to: `${email}`,
        subject: 'Verificación de cuenta - Tu Billetera Virtual',
        templateName: 'notification-token',
        data: {
          Session: ` ${verificationCode}`,
          Token: `${email}`,
        },
      };

      await this.sendMail(dataEmailUser);
      console.log('Verification email sent successfully');
      return `Verification email sent successfully`;
    } catch (error) {
      console.error('Error sending verification email', error);
      return {
        code: 500,
        message: 'Error al enviar correo de verificación',
      };
    }
  }

  async transactionMail(email: string, sessionId: string, token: any) {
    try {
      const dataEmailUser: IEmailBody = {
        from: `Tu Billetera Virtual <${this.environmentsService.emailFrom}>`,
        to: `${email}`,
        subject: 'Confirmación de compra',
        templateName: 'notification-token',
        data: {
          Session: `${sessionId}`,
          Token: `${token}`,
        },
      };

      await this.sendMail(dataEmailUser);
      console.log('End of notifications user');
      return `Notifications were successfully sending`;
    } catch (error) {
      console.error('Ocurrio un error en el axios', error);
      return {
        code: 500,
        message: 'Error al enviar correos',
      };
    }
  }
}
