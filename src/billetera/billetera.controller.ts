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
    const saldo = await this.billeteraService.consultarSaldo(documento);
    return { success: true, cod_error: '00', message_error: '', data: saldo };
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
  }
}
