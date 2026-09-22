import { forwardRef, Module } from '@nestjs/common';
import { UsuariosParkingService } from './usuariosParking.service.js';
import { UsuariosParkingController } from './usuariosParking.controller.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';
import { AccessModule } from '../../common/access/access.module.js';

@Module({
    imports:[OnBehalfOfModule, GraphRestModule, forwardRef(() => AccessModule)],
    controllers: [UsuariosParkingController],
    providers: [UsuariosParkingService],
    exports: [UsuariosParkingService],
})
export class UsuariosParkingModule {};