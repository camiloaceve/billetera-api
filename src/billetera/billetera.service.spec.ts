import { Test, TestingModule } from '@nestjs/testing';
import { BilleteraService } from './billetera.service';

describe('BilleteraService', () => {
  let service: BilleteraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BilleteraService],
    }).compile();

    service = module.get<BilleteraService>(BilleteraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
