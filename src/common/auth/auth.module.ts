import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TokenGuard } from './auth.guard.js';
import { DebugTokenGuard } from './debug-auth.guard.js';
//se importa el auth guard (la estrategia de passport que se creo)
@Module({
  imports: [PassportModule],
  providers: [TokenGuard, DebugTokenGuard], // se realiza la llamada a la estrategia que se realizo
})
export class AuthModule {}
