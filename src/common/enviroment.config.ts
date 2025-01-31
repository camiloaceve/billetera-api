import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvironmentService {
  secret: string = process.env.SECRET || 'Default';
  expireToken: string = process.env.JWT_EXPIRES_IN || '10m';
  mailUrl: string = process.env.URL_EMAIL;
  emailFrom: string = process.env.EMAIL_FROM;
}
