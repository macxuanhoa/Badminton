import { Module } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CourtsController } from './courts.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CourtsService],
  controllers: [CourtsController],
  exports: [CourtsService],
})
export class CourtsModule {}
