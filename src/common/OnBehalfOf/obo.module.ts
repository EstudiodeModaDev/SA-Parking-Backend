import { Module } from '@nestjs/common';
import { OnBehalfOfService } from './obo.service.js';
import { HttpModule } from '@nestjs/axios';
//importar aqui tanto el service como el controller del router

@Module({
  imports: [HttpModule],
  controllers: [], //realizar la llamada correspondiente al service y al controller
  providers: [OnBehalfOfService],
  exports: [OnBehalfOfService],
})
export class OnBehalfOfModule {}
