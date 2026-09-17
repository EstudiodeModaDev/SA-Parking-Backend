import { Module } from '@nestjs/common';
import { settingsControler } from './settings.controller.js';
import { settingsService } from './settings.service.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';

@Module({
    imports:[OnBehalfOfModule, GraphRestModule],
    controllers: [settingsControler],
    providers: [settingsService],
})
export class SettingsModule {};