import { IsString, IsNumber, IsEmail, Min, MaxLength } from 'class-validator';

export class IniciarPagoDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(20)
  documento: string;

  @IsNumber()
  @Min(1000)
  monto: number;
}

export class PagoTokenDto {
  @IsString()
  @MaxLength(20)
  origen: string;

  @IsString()
  @MaxLength(20)
  destino: string;

  @IsNumber()
  @Min(1000)
  monto: number;

  @IsString()
  token: string;
}

export class ConfirmarPagoDto {
  @IsString()
  sessionId: string;

  @IsString()
  token: string;
}
