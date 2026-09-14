import { Module } from '@nestjs/common';
import { RegistroVehicularModule } from './registro_vehicular/registro.module.js'; 
import { AuthModule } from './common/auth/auth.module.js';
//aqui se deben importar todos los modulos de cada reouter diferente

@Module({
  imports: [RegistroVehicularModule, AuthModule], // hacer la llamada al modulo correspondiente
  controllers: [],
  providers: [],
})
export class AppModule {}
