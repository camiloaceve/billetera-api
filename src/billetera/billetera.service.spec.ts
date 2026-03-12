import { Test, TestingModule } from '@nestjs/testing';
import { BilleteraService } from './billetera.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Billetera, BilleteraSchema } from './schemas/billetera.schema';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../auth/email/email.service';
import { AuditService } from '../audit/audit.service';

describe('BilleteraService', () => {
  let service: BilleteraService;
  let billeteraModel: Model<Billetera>;
  let authService: AuthService;
  let emailService: EmailService;
  let auditService: AuditService;
  let module: TestingModule;

  const mockAuthService = {
    generarToken: jest.fn(),
    verificarToken: jest.fn(),
  };

  const mockEmailService = {
    transactionMail: jest.fn(),
  };

  const mockAuditService = {
    logSuccess: jest.fn(),
    logError: jest.fn(),
    logPending: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_URL!),
        MongooseModule.forFeature([
          { name: Billetera.name, schema: BilleteraSchema },
        ]),
      ],
      providers: [
        BilleteraService,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<BilleteraService>(BilleteraService);
    billeteraModel = module.get<Model<Billetera>>(`${Billetera.name}Model`);
    authService = module.get<AuthService>(AuthService);
    emailService = module.get<EmailService>(EmailService);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('consultarSaldo', () => {
    it('should return wallet balance', async () => {
      const documento = '123456789';
      const billeteraMock = { documento, saldo: 1000 };

      jest
        .spyOn(billeteraModel, 'findOne')
        .mockResolvedValue(billeteraMock as any);
      mockAuditService.logSuccess.mockResolvedValue({} as any);

      const result = await service.consultarSaldo(documento);

      expect(billeteraModel.findOne).toHaveBeenCalledWith({ documento });
      expect(mockAuditService.logSuccess).toHaveBeenCalled();
      expect(result).toEqual(billeteraMock);
    });

    it('should handle errors', async () => {
      const documento = '123456789';
      const error = new Error('Database error');

      jest.spyOn(billeteraModel, 'findOne').mockRejectedValue(error);
      mockAuditService.logError.mockResolvedValue({} as any);

      const result = await service.consultarSaldo(documento);

      expect(mockAuditService.logError).toHaveBeenCalled();
      expect(result).toBe(error.message);
    });
  });

  describe('recargarSaldo', () => {
    it('should recharge wallet successfully', async () => {
      const documento = '123456789';
      const valor = 5000;
      const billeteraMock = { documento, saldo: 6000 };

      jest
        .spyOn(billeteraModel, 'findOneAndUpdate')
        .mockResolvedValue(billeteraMock as any);
      mockAuditService.logSuccess.mockResolvedValue({} as any);

      const result = await service.recargarSaldo(documento, valor);

      expect(billeteraModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockAuditService.logSuccess).toHaveBeenCalled();
      expect(result).toEqual(billeteraMock);
    });

    it('should handle recharge errors', async () => {
      const documento = '123456789';
      const valor = 5000;
      const error = new Error('Transaction failed');

      jest.spyOn(billeteraModel, 'findOneAndUpdate').mockRejectedValue(error);
      mockAuditService.logError.mockResolvedValue({} as any);

      await expect(service.recargarSaldo(documento, valor)).rejects.toThrow(
        error,
      );
      expect(mockAuditService.logError).toHaveBeenCalled();
    });
  });

  describe('realizarPago', () => {
    it('should perform payment successfully', async () => {
      const origen = '123456789';
      const destino = '987654321';
      const monto = 1000;

      const billeteraOrigen = { documento: origen, saldo: 2000 };
      const billeteraDestino = { documento: destino, saldo: 1000 };

      jest
        .spyOn(billeteraModel, 'findOne')
        .mockResolvedValue(billeteraOrigen as any);
      jest.spyOn(billeteraModel, 'updateOne').mockResolvedValue({} as any);

      const result = await service.realizarPago(origen, destino, monto);

      expect(billeteraModel.findOne).toHaveBeenCalledTimes(2);
      expect(billeteraModel.updateOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ mensaje: 'Pago realizado con éxito', monto });
    });

    it('should throw error for insufficient balance', async () => {
      const origen = '123456789';
      const destino = '987654321';
      const monto = 3000;

      const billeteraOrigen = { documento: origen, saldo: 2000 };
      const billeteraDestino = { documento: destino, saldo: 1000 };

      jest
        .spyOn(billeteraModel, 'findOne')
        .mockResolvedValue(billeteraOrigen as any);

      await expect(
        service.realizarPago(origen, destino, monto),
      ).rejects.toThrow('Saldo insuficiente');
    });

    it('should throw error if wallet does not exist', async () => {
      const origen = '123456789';
      const destino = '987654321';
      const monto = 1000;

      jest.spyOn(billeteraModel, 'findOne').mockResolvedValue(null);

      await expect(
        service.realizarPago(origen, destino, monto),
      ).rejects.toThrow('Una de las billeteras no existe');
    });
  });

  describe('iniciarDePago', () => {
    it('should initiate payment successfully', async () => {
      const email = 'test@example.com';
      const documento = '123456789';
      const monto = 1000;
      const sessionId = 'session-123';
      const tokenData = { token: 'jwt-token' };

      mockAuthService.generarToken.mockReturnValue(tokenData);
      mockEmailService.transactionMail.mockResolvedValue({});
      mockAuditService.logPending.mockResolvedValue({} as any);
      mockAuditService.logSuccess.mockResolvedValue({} as any);

      const result = await service.iniciarDePago(email, documento, monto);

      expect(mockAuthService.generarToken).toHaveBeenCalledWith(
        sessionId,
        documento,
        monto,
      );
      expect(mockEmailService.transactionMail).toHaveBeenCalledWith(
        email,
        sessionId,
        tokenData.token,
      );
      expect(mockAuditService.logPending).toHaveBeenCalled();
      expect(mockAuditService.logSuccess).toHaveBeenCalled();
      expect(result).toEqual({
        mensaje: 'Se ha enviado un correo con el código de confirmación.',
        sessionId,
      });
    });

    it('should handle payment initiation errors', async () => {
      const email = 'test@example.com';
      const documento = '123456789';
      const monto = 1000;
      const error = new Error('Email failed');

      mockAuthService.generarToken.mockReturnValue({ token: 'jwt-token' });
      mockEmailService.transactionMail.mockRejectedValue(error);
      mockAuditService.logPending.mockResolvedValue({} as any);
      mockAuditService.logError.mockResolvedValue({} as any);

      const result = await service.iniciarDePago(email, documento, monto);

      expect(mockAuditService.logError).toHaveBeenCalled();
      expect(result).toBe(error.message);
    });
  });
});
