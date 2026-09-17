import { Module } from '@nestjs/common';
import { RegistroVehicularModule } from './registro_vehicular/registro.module.js'; 
import { AuthModule } from './common/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
//aqui se deben importar todos los modulos de cada reouter diferente

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    RegistroVehicularModule,
    AuthModule, 
    // hacer la llamada al modulo correspondiente
  ], 
  controllers: [],
  providers: [],
})
export class AppModule {}
