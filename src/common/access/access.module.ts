import { Module } from '@nestjs/common';
import { AccessService } from './access.service.js';
import { UsuariosParkingModule } from '../../routes/usuariosParking/usuariosParking.module.js';
import { GraphRestModule } from '../graph/graphRest.module.js';
@Module({
    imports: [UsuariosParkingModule, GraphRestModule],
    controllers: [],
    providers: [AccessService],
    exports: [AccessService],
})
export class AccessModule {};