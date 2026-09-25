import { Module } from '@nestjs/common';
import { settingsControler } from './settings.controller.js';
import { settingsService } from './settings.service.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';
import { AccessModule } from '../../common/access/access.module.js';

@Module({
    imports:[OnBehalfOfModule, GraphRestModule, AccessModule],
    controllers: [settingsControler],
    providers: [settingsService],
})
export class SettingsModule {};