import { Test, TestingModule } from '@nestjs/testing';
import { BilleteraController } from './billetera.controller';

describe('BilleteraController', () => {
  let controller: BilleteraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BilleteraController],
    }).compile();

    controller = module.get<BilleteraController>(BilleteraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
