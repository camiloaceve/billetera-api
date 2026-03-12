import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 3600, // 1 hora por defecto
      max: 1000, // máximo 1000 items en cache
      isGlobal: true,
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
