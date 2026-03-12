import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentService } from 'src/common/enviroment.config';
import { EmailService } from './email/email.service';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    AuthService,
    EnvironmentService,
    EmailService,
    JwtStrategy,
    EmailVerificationService,
  ],
  controllers: [AuthController],
  exports: [AuthService, EmailService, JwtStrategy],
})
export class AuthModule {}
