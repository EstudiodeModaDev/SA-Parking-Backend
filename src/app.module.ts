import { Module } from '@nestjs/common';
import { RegistroVehicularModule } from './routes/registro_vehicular/registroVehicular.module.js';
import { AuthModule } from './common/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './routes/settings/settings.module.js';
//aqui se deben importar todos los modulos de cada reouter diferente

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    //RegistroVehicularModule,
    AuthModule,
    SettingsModule
    // hacer la llamada al modulo correspondiente
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
