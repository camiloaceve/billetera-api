import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schemas/cliente.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClientesService {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
  ) {}

  async registrarCliente(data: any) {
    const nuevoCliente = new this.clienteModel(data);
    return await nuevoCliente.save();
  }
}
