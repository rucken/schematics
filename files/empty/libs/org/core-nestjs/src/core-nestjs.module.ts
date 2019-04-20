import { Module } from '@nestjs/common';
import { CoreNestjsService } from './core-nestjs.service';

@Module({
  providers: [CoreNestjsService],
  exports: [CoreNestjsService]
})
export class CoreNestjsModule {}
