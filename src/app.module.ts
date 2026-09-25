import { Module } from '@nestjs/common';
import { AuthModule } from './common/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './routes/settings/settings.module.js';
import { UsuariosParkingModule } from './routes/usuariosParking/usuariosParking.module.js';
import { ColaboradoresModule } from './routes/colaboradores/colaboradores.module.js';
import { ParkingSlotsModule } from './routes/parkingSlots/parkingSlots.module.js';
import { RegistroVehicularModule } from './routes/registroVehicular/registroVehicular.module.js';
import { ReservasModule } from './routes/reservas/reservas.module.js';
import { logModule } from './common/log/log.module.js';
import { logExceptionFilter } from './common/log/log.filter.js';
import { APP_FILTER } from '@nestjs/core';
//aqui se deben importar todos los modulos de cada reouter diferente

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SettingsModule,
    UsuariosParkingModule,
    ColaboradoresModule,
    ParkingSlotsModule,
    RegistroVehicularModule,
    ReservasModule,
    logModule,
    // hacer la llamada al modulo correspondiente
  ],
  controllers: [],
  // filtro global que registra en la lista de logs todos los errores de los endpoints
  providers: [{ provide: APP_FILTER, useClass: logExceptionFilter }],
})
export class AppModule {}

