import { Body, Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { ClientesFrecuentesService } from './clientes-frecuentes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly clientesFrecuentesService: ClientesFrecuentesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al registrar cliente.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documento: { type: 'string', example: '123456789' },
        nombres: { type: 'string', example: 'Juan Pérez' },
        email: { type: 'string', example: 'juan.perez@example.com' },
        celular: { type: 'string', example: '+573001234567' },
      },
    },
  })
  async registrarCliente(@Body() data: any) {
    try {
      const cliente = await this.clientesService.registrarCliente(data);
      return {
        success: true,
        cod_error: '00',
        message_error: 'Registro exitoso',
        data: cliente,
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '01',
        message_error: 'Error al registrar cliente',
        data: error,
      };
    }
  }

  @Get('frecuentes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener clientes frecuentes' })
  @ApiResponse({ status: 200, description: 'Clientes frecuentes obtenidos.' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Número de clientes a retornar',
  })
  async getClientesFrecuentes(@Query('limit') limit?: string) {
    try {
      const clientes =
        await this.clientesFrecuentesService.getClientesFrecuentes(
          limit ? parseInt(limit) : 10,
        );
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: clientes,
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Get('estadisticas')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de clientes' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas.' })
  async getEstadisticasClientes() {
    try {
      const estadisticas =
        await this.clientesFrecuentesService.getEstadisticasClientes();
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: estadisticas,
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Get('buscar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar cliente por documento' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiQuery({
    name: 'documento',
    required: true,
    type: 'string',
    example: '123456789',
  })
  async buscarCliente(@Query('documento') documento: string) {
    try {
      const cliente =
        await this.clientesFrecuentesService.buscarClientePorDocumento(
          documento,
        );
      if (!cliente) {
        return {
          success: false,
          cod_error: '01',
          message_error: 'Cliente no encontrado',
        };
      }
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: cliente,
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }
}
