import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';

@ApiTags('Clientes') // Agrupa las rutas de este controlador bajo la etiqueta "Clientes"
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

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
}
