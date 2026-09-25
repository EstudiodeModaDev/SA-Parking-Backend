import { Module } from '@nestjs/common';
import { logService } from './log.service.js';
import { GraphRestModule } from '../graph/graphRest.module.js';

@Module({
    imports : [GraphRestModule],
    providers: [logService],
    exports: [logService]
})
export class logModule {};
