import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { BilleteraService } from './billetera.service';

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
  async consultarSaldo(@Query('documento') documento: string) {
    try {
      const saldo = await this.billeteraService.consultarSaldo(documento);
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
  async recargarSaldo(@Body() { documento, valor }: any) {
    try {
      const billetera = await this.billeteraService.recargarSaldo(
        documento,
        valor,
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
  async generarTokenDePago(@Body() { email, documento, monto }: any) {
    try {
      const token = await this.billeteraService.iniciarDePago(
        email,
        documento,
        monto,
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
  async realizarPagoConToken(@Body() { origen, destino, monto, token }: any) {
    try {
      const resultado = await this.billeteraService.realizarPagoConToken(
        origen,
        destino,
        monto,
        token,
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
  async confirmarPago(@Body() { sessionId, token }: any) {
    try {
      const resultado = await this.billeteraService.confirmarPago(
        sessionId,
        token,
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
