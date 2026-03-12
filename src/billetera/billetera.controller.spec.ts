import { Test, TestingModule } from '@nestjs/testing';
import { BilleteraController } from './billetera.controller';
import { BilleteraService } from './billetera.service';
import { ConsultaSaldoDto } from './dto/saldo.dto';
import { RecargaDto } from './dto/recarga.dto';
import { IniciarPagoDto, PagoTokenDto, ConfirmarPagoDto } from './dto/pago.dto';

describe('BilleteraController', () => {
  let controller: BilleteraController;
  let service: BilleteraService;

  const mockBilleteraService = {
    consultarSaldo: jest.fn(),
    recargarSaldo: jest.fn(),
    iniciarDePago: jest.fn(),
    realizarPagoConToken: jest.fn(),
    confirmarPago: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BilleteraController],
      providers: [
        {
          provide: BilleteraService,
          useValue: mockBilleteraService,
        },
      ],
    }).compile();

    controller = module.get<BilleteraController>(BilleteraController);
    service = module.get<BilleteraService>(BilleteraService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('consultarSaldo', () => {
    it('should return wallet balance', async () => {
      const query: ConsultaSaldoDto = { documento: '123456789' };
      const saldoMock = { documento: '123456789', saldo: 1000 };

      mockBilleteraService.consultarSaldo.mockResolvedValue(saldoMock);

      const result = await controller.consultarSaldo(query);

      expect(service.consultarSaldo).toHaveBeenCalledWith(query.documento);
      expect(result).toEqual({
        success: true,
        cod_error: '00',
        message_error: '',
        data: saldoMock,
      });
    });

    it('should handle errors', async () => {
      const query: ConsultaSaldoDto = { documento: '123456789' };
      const error = new Error('Wallet not found');

      mockBilleteraService.consultarSaldo.mockRejectedValue(error);

      const result = await controller.consultarSaldo(query);

      expect(result).toEqual({
        success: false,
        cod_error: '02',
        message_error: error.message,
      });
    });
  });

  describe('recargarSaldo', () => {
    it('should recharge wallet successfully', async () => {
      const recargaDto: RecargaDto = { documento: '123456789', valor: 5000 };
      const billeteraMock = { documento: '123456789', saldo: 6000 };

      mockBilleteraService.recargarSaldo.mockResolvedValue(billeteraMock);

      const result = await controller.recargarSaldo(recargaDto);

      expect(service.recargarSaldo).toHaveBeenCalledWith(
        recargaDto.documento,
        recargaDto.valor,
      );
      expect(result).toEqual({
        success: true,
        cod_error: '00',
        message_error: 'Recarga exitosa',
        data: billeteraMock,
      });
    });

    it('should handle recharge errors', async () => {
      const recargaDto: RecargaDto = { documento: '123456789', valor: 5000 };
      const error = new Error('Transaction failed');

      mockBilleteraService.recargarSaldo.mockRejectedValue(error);

      const result = await controller.recargarSaldo(recargaDto);

      expect(result).toEqual({
        success: false,
        cod_error: '02',
        message_error: error.message,
      });
    });
  });

  describe('generarTokenDePago', () => {
    it('should generate payment token successfully', async () => {
      const pagoDto: IniciarPagoDto = {
        email: 'test@example.com',
        documento: '123456789',
        monto: 1000,
      };
      const tokenResponse = {
        mensaje: 'Se ha enviado un correo con el código de confirmación.',
        sessionId: 'session-123',
      };

      mockBilleteraService.iniciarDePago.mockResolvedValue(tokenResponse);

      const result = await controller.generarTokenDePago(pagoDto);

      expect(service.iniciarDePago).toHaveBeenCalledWith(
        pagoDto.email,
        pagoDto.documento,
        pagoDto.monto,
      );
      expect(result).toEqual({
        success: true,
        cod_error: '00',
        message_error: '',
        data: tokenResponse,
      });
    });

    it('should handle payment token generation errors', async () => {
      const pagoDto: IniciarPagoDto = {
        email: 'test@example.com',
        documento: '123456789',
        monto: 1000,
      };
      const error = new Error('Email failed');

      mockBilleteraService.iniciarDePago.mockRejectedValue(error);

      const result = await controller.generarTokenDePago(pagoDto);

      expect(result).toEqual({
        success: false,
        cod_error: '02',
        message_error: error.message,
      });
    });
  });

  describe('realizarPagoConToken', () => {
    it('should perform payment with token successfully', async () => {
      const pagoDto: PagoTokenDto = {
        origen: '123456789',
        destino: '987654321',
        monto: 1000,
        token: 'jwt-token',
      };
      const resultadoMock = {
        mensaje: 'Pago realizado con éxito',
        monto: 1000,
      };

      mockBilleteraService.realizarPagoConToken.mockResolvedValue(
        resultadoMock,
      );

      const result = await controller.realizarPagoConToken(pagoDto);

      expect(service.realizarPagoConToken).toHaveBeenCalledWith(
        pagoDto.origen,
        pagoDto.destino,
        pagoDto.monto,
        pagoDto.token,
      );
      expect(result).toEqual({
        success: true,
        cod_error: '00',
        message_error: '',
        data: resultadoMock,
      });
    });

    it('should handle payment with token errors', async () => {
      const pagoDto: PagoTokenDto = {
        origen: '123456789',
        destino: '987654321',
        monto: 1000,
        token: 'invalid-token',
      };
      const error = new Error('Invalid token');

      mockBilleteraService.realizarPagoConToken.mockRejectedValue(error);

      const result = await controller.realizarPagoConToken(pagoDto);

      expect(result).toEqual({
        success: false,
        cod_error: '02',
        message_error: error.message,
      });
    });
  });

  describe('confirmarPago', () => {
    it('should confirm payment successfully', async () => {
      const confirmDto: ConfirmarPagoDto = {
        sessionId: 'session-123',
        token: 'jwt-token',
      };
      const resultadoMock = { mensaje: 'Pago confirmado', monto: 1000 };

      mockBilleteraService.confirmarPago.mockResolvedValue(resultadoMock);

      const result = await controller.confirmarPago(confirmDto);

      expect(service.confirmarPago).toHaveBeenCalledWith(
        confirmDto.sessionId,
        confirmDto.token,
      );
      expect(result).toEqual({
        success: true,
        cod_error: '00',
        message_error: '',
        data: resultadoMock,
      });
    });

    it('should handle payment confirmation errors', async () => {
      const confirmDto: ConfirmarPagoDto = {
        sessionId: 'invalid-session',
        token: 'invalid-token',
      };
      const error = new Error('Invalid session');

      mockBilleteraService.confirmarPago.mockRejectedValue(error);

      const result = await controller.confirmarPago(confirmDto);

      expect(result).toEqual({
        success: false,
        cod_error: '02',
        message_error: error.message,
      });
    });
  });
});
