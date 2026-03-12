import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { BilleteraService } from './billetera.service';
import { ConsultaSaldoDto } from './dto/saldo.dto';
import { RecargaDto } from './dto/recarga.dto';
import { IniciarPagoDto, PagoTokenDto, ConfirmarPagoDto } from './dto/pago.dto';

@ApiTags('Billetera')
@Controller('billetera')
export class BilleteraController {
  constructor(private readonly billeteraService: BilleteraService) {}

  @Get('saldo')
  @ApiOperation({ summary: 'Consultar el saldo de la billetera' })
  @ApiResponse({ status: 200, description: 'Saldo consultado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en la consulta de saldo.' })
  @ApiQuery({
    name: 'documento',
    required: true,
    type: 'string',
    example: '123456789',
  })
  async consultarSaldo(@Query() query: ConsultaSaldoDto) {
    try {
      const saldo = await this.billeteraService.consultarSaldo(query.documento);
      return { success: true, cod_error: '00', message_error: '', data: saldo };
    } catch (error) {
      return { success: false, cod_error: '02', message_error: error.message };
    }
  }

  @Post('recarga')
  @ApiOperation({ summary: 'Recargar saldo en la billetera' })
  @ApiResponse({ status: 201, description: 'Recarga exitosa.' })
  @ApiResponse({ status: 400, description: 'Error al recargar saldo.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documento: { type: 'string', example: '123456789' },
        valor: { type: 'number', example: 50000 },
      },
    },
  })
  async recargarSaldo(@Body() recargaDto: RecargaDto) {
    try {
      const billetera = await this.billeteraService.recargarSaldo(
        recargaDto.documento,
        recargaDto.valor,
      );
      return {
        success: true,
        cod_error: '00',
        message_error: 'Recarga exitosa',
        data: billetera,
      };
    } catch (error) {
      return { success: false, cod_error: '02', message_error: error.message };
    }
  }

  @Post('iniciar-pago')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'juan.perez@yopmail.com' },
        documento: { type: 'string', example: '123456789' },
        monto: { type: 'number', example: 1000 },
      },
      required: ['email', 'documento', 'monto'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token de pago generado exitosamente.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        cod_error: { type: 'string', example: '00' },
        message_error: { type: 'string', example: '' },
        data: { type: 'string', example: 'token_generado' },
      },
    },
  })
  async generarTokenDePago(@Body() pagoDto: IniciarPagoDto) {
    try {
      const token = await this.billeteraService.iniciarDePago(
        pagoDto.email,
        pagoDto.documento,
        pagoDto.monto,
      );
      console.log(token);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: token,
      };
    } catch (error) {
      return { success: false, cod_error: '02', message_error: error.message };
    }
  }

  @ApiOperation({ summary: 'Realizar pago con token' })
  @ApiBody({
    description: 'Datos del pago con token',
    type: Object,
    examples: {
      ejemplo1: {
        value: {
          origen: '123456789',
          destino: '987654321',
          monto: 20000,
          token: 'TOKEN_GENERADO',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pago realizado con éxito',
    schema: {
      example: {
        success: true,
        cod_error: '00',
        message_error: '',
        data: {},
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el pago',
    schema: {
      example: {
        success: false,
        cod_error: '02',
        message_error: '',
      },
    },
  })
  @Post('pago-token')
  async realizarPagoConToken(@Body() pagoDto: PagoTokenDto) {
    try {
      const resultado = await this.billeteraService.realizarPagoConToken(
        pagoDto.origen,
        pagoDto.destino,
        pagoDto.monto,
        pagoDto.token,
      );
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: resultado,
      };
    } catch (error) {
      return { success: false, cod_error: '02', message_error: error.message };
    }
  }

  @Post('confirmar-pago')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          example: '220c3814-71ff-4ab4-b2a8-9b0fa896f94f',
        },
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['sessionId', 'token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pago confirmado exitosamente.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        cod_error: { type: 'string', example: '00' },
        message_error: { type: 'string', example: '' },
        data: { type: 'string', example: 'resultado_confirmacion' },
      },
    },
  })
  async confirmarPago(@Body() confirmDto: ConfirmarPagoDto) {
    try {
      const resultado = await this.billeteraService.confirmarPago(
        confirmDto.sessionId,
        confirmDto.token,
      );
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: resultado,
      };
    } catch (error) {
      return { success: false, cod_error: '02', message_error: error.message };
    }
  }
}
