import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { Billetera } from '../billetera/schemas/billetera.schema';

export interface ClienteFrecuente {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  telefono: string;
  totalTransactions: number;
  totalAmount: number;
  loginCount: number;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  isActive: boolean;
  profile: Record<string, any>;
  saldoActual?: number;
}

export interface EstadisticasClientes {
  totalClientes: number;
  clientesActivos: number;
  totalTransacciones: number;
  montoTotalTransacciones: number;
  promedioTransaccionesPorCliente: number;
  clientesConMasTransacciones: ClienteFrecuente[];
  clientesConMayorMonto: ClienteFrecuente[];
  crecimientoMensual: Array<{
    mes: string;
    nuevosClientes: number;
    transacciones: number;
  }>;
}

@Injectable()
export class ClientesFrecuentesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Billetera.name) private billeteraModel: Model<Billetera>,
  ) {}

  async getClientesFrecuentes(limit = 10): Promise<ClienteFrecuente[]> {
    const clientes = await this.userModel
      .find({ isActive: true })
      .select('-password')
      .sort({ totalTransactions: -1, totalAmount: -1 })
      .limit(limit)
      .lean();

    const clientesConSaldo = await Promise.all(
      clientes.map(async (cliente) => {
        const billetera = await this.billeteraModel.findOne({
          documento: cliente.documento,
        });
        return {
          ...cliente,
          saldoActual: billetera?.saldo || 0,
        } as unknown as ClienteFrecuente;
      }),
    );

    return clientesConSaldo;
  }

  async getEstadisticasClientes(): Promise<EstadisticasClientes> {
    const [
      totalClientes,
      clientesActivos,
      clientesTopTransacciones,
      clientesTopMonto,
      crecimientoMensual,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.userModel
        .find({ isActive: true })
        .sort({ totalTransactions: -1 })
        .limit(5)
        .lean(),
      this.userModel
        .find({ isActive: true })
        .sort({ totalAmount: -1 })
        .limit(5)
        .lean(),
      this.getCrecimientoMensual(),
    ]);

    const stats = await this.userModel.aggregate([
      {
        $group: {
          _id: null,
          totalTransacciones: { $sum: '$totalTransactions' },
          montoTotalTransacciones: { $sum: '$totalAmount' },
        },
      },
    ]);

    const { totalTransacciones = 0, montoTotalTransacciones = 0 } =
      stats[0] || {};

    const clientesConSaldo = await Promise.all([
      Promise.all(
        clientesTopTransacciones.map(async (cliente: any) => {
          const billetera = await this.billeteraModel.findOne({
            documento: cliente.documento,
          });
          return {
            ...cliente,
            saldoActual: billetera?.saldo || 0,
          } as unknown as ClienteFrecuente;
        }),
      ),
      Promise.all(
        clientesTopMonto.map(async (cliente: any) => {
          const billetera = await this.billeteraModel.findOne({
            documento: cliente.documento,
          });
          return {
            ...cliente,
            saldoActual: billetera?.saldo || 0,
          } as unknown as ClienteFrecuente;
        }),
      ),
    ]);

    return {
      totalClientes,
      clientesActivos,
      totalTransacciones,
      montoTotalTransacciones,
      promedioTransaccionesPorCliente:
        totalClientes > 0 ? totalTransacciones / totalClientes : 0,
      clientesConMasTransacciones: clientesConSaldo[0],
      clientesConMayorMonto: clientesConSaldo[1],
      crecimientoMensual,
    };
  }

  private async getCrecimientoMensual(): Promise<
    Array<{ mes: string; nuevosClientes: number; transacciones: number }>
  > {
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const crecimiento = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: seisMesesAtras },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          nuevosClientes: { $sum: 1 },
          transacciones: { $sum: '$totalTransactions' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return crecimiento.map((item) => ({
      mes: meses[item._id.month - 1],
      nuevosClientes: item.nuevosClientes,
      transacciones: item.transacciones,
    }));
  }

  async buscarClientePorDocumento(
    documento: string,
  ): Promise<ClienteFrecuente | null> {
    const cliente = await this.userModel
      .findOne({ documento })
      .select('-password')
      .lean();
    if (!cliente) return null;

    const billetera = await this.billeteraModel.findOne({ documento });
    return {
      ...cliente,
      saldoActual: billetera?.saldo || 0,
    } as unknown as ClienteFrecuente;
  }

  async actualizarEstadisticasUsuario(
    userId: string,
    monto: number,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: {
        totalTransactions: 1,
        totalAmount: monto,
      },
    });
  }
}
