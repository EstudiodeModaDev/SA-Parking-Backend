import { Module } from '@nestjs/common';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { ParkingSlotsController } from './parkingSlots.controller.js';
import { ParkingSlotsService } from './parkingSlots.service.js';
import { AccessModule } from '../../common/access/access.module.js';

@Module({
    imports:[GraphRestModule, OnBehalfOfModule, AccessModule],
    controllers: [ParkingSlotsController],
    providers: [ParkingSlotsService],
    exports: [ParkingSlotsService]
})
export class ParkingSlotsModule {};