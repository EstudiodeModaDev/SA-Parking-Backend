import { Module } from '@nestjs/common';
import { UsuariosParkingService } from './usuariosParking.service.js';
import { UsuariosParkingController } from './usuariosParking.controller.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';

@Module({
    imports:[OnBehalfOfModule, GraphRestModule],
    controllers: [UsuariosParkingController],
    providers: [UsuariosParkingService],
})
export class UsuariosParkingModule {};