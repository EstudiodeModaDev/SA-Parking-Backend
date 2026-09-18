import { Module } from '@nestjs/common';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { ParkingSlotsController } from './parkingSlots.controller.js';
import { ParkingSlotsService } from './parkingSlots.service.js';

@Module({
    imports:[GraphRestModule, OnBehalfOfModule],
    controllers: [ParkingSlotsController],
    providers: [ParkingSlotsService],
})
export class ParkingSlotsModule {};