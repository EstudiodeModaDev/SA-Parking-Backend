import { Module } from '@nestjs/common';
import { AuthModule } from './common/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './routes/settings/settings.module.js';
import { UsuariosParkingModule } from './routes/usuariosParking/usuariosParking.module.js';
import { ColaboradoresModule } from './routes/colaboradores/colaboradores.module.js';
//aqui se deben importar todos los modulos de cada reouter diferente

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SettingsModule,
    UsuariosParkingModule,
    ColaboradoresModule
    // hacer la llamada al modulo correspondiente
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
