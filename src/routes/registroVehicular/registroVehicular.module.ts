import { Module } from '@nestjs/common';
import { RegistroVehicularService } from './registroVehicular.service.js';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';
import { RegistroVehicularController } from './registroVehicular.controller.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { AccessModule } from '../../common/access/access.module.js';

@Module({
    imports: [GraphRestModule, OnBehalfOfModule, AccessModule],
    controllers: [RegistroVehicularController],
    providers: [RegistroVehicularService],
})
export class RegistroVehicularModule {};