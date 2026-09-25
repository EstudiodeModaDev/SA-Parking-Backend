import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GraphRestService } from './graphRest.service.js';

//importar aqui tanto el service como el controller del router

@Module({
  imports: [HttpModule],
  controllers: [], //realizar la llamada correspondiente al service y al controller
  providers: [GraphRestService],
  exports: [GraphRestService],
})
export class GraphRestModule {}
