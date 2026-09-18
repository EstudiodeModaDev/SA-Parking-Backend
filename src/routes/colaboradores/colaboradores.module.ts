import { Module } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service.js';
import { ColaboradoresController } from './colaboradores.controller.js';
import { GraphRestModule } from '../../common/graph/graphRest.module.js';
import { OnBehalfOfModule } from '../../common/OnBehalfOf/obo.module.js';
@Module({
    imports:[GraphRestModule, OnBehalfOfModule],
    controllers: [ColaboradoresController],
    providers: [ColaboradoresService],
})
export class ColaboradoresModule  {};