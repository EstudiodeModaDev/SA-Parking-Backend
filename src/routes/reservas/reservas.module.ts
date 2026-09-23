import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller.js';
import { reservasService } from './reservas.service.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';
import { AccessModule } from '../../common/access/access.module.js';
import { UsuariosParkingModule } from '../usuariosParking/usuariosParking.module.js';
import { ParkingSlotsModule } from '../parkingSlots/parkingSlots.module.js';


@Module({
    imports: [AccessModule, OnBehalfOfModule, GraphRestModule, UsuariosParkingModule, ParkingSlotsModule],
    controllers: [ReservasController],
    providers: [reservasService],
})
export class ReservasModule {};