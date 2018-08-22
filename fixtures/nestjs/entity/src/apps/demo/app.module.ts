import { AuthModule } from '@demo/auth-nestjs';
import { CoreModule } from '@demo/core-nestjs';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoModule } from './demo.module';

@Module({
  imports: [TypeOrmModule.forRoot(), CoreModule, AuthModule, DemoModule]
})
export class AppModule {
  static forRoot(options: { providers: Provider[] }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypeOrmModule.forRoot(),
        CoreModule.forRoot(options),
        AuthModule.forRoot(options),
        DemoModule.forRoot(options)
      ]
    };
  }
}
