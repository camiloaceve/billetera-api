import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';

// Setup de variables de entorno para tests
beforeAll(async () => {
  process.env.MONGO_URL = 'mongodb://localhost:27017/test-billetera';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.LOG_LEVEL = 'error';
});

afterEach(async () => {
  // Limpiar base de datos después de cada test
  const module: TestingModule = await Test.createTestingModule({
    imports: [MongooseModule.forRoot(process.env.MONGO_URL!)],
  }).compile();

  const mongoose = module.get<any>('Connection');
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Mock console methods para cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
