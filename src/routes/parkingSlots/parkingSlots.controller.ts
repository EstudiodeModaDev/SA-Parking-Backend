import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ParkingSlotsService } from './parkingSlots.service.js';
import { AuthGuard } from '@nestjs/passport';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import { AccessService } from '../../common/access/access.service.js';

@Controller('parkingSlots')
export class ParkingSlotsController {
  constructor(
    private readonly parkingSlotService: ParkingSlotsService,
    private readonly OBOService: OnBehalfOfService,
    private readonly accessService: AccessService,
  ) {}

  @Get('getSlots')
  @UseGuards(AuthGuard('azure-token'))
  async getSlots(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.parkingSlotService.getParkingSlots(graphToken);
  }

  @Post('createSlot')
  @UseGuards(AuthGuard('azure-token'))
  async CreateSlot(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.parkingSlotService.createSlot(graphToken, req.body);
  }

  @Put('inactiveSlot/:id')
  @UseGuards(AuthGuard('azure-token'))
  async InactiveSlot(@Req() req: Request, @Param('id') id: string) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.parkingSlotService.putSlot(graphToken, id, {
      Activa: 'Inactiva',
    });
  }

  @Put('activeSlot/:id')
  @UseGuards(AuthGuard('azure-token'))
  async activeSlot(@Req() req: Request, @Param('id') id: string) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.parkingSlotService.putSlot(graphToken, id, {
      Activa: 'Activa',
    });
  }

  @Put('editSlot/:id')
  @UseGuards(AuthGuard('azure-token'))
  async editSlot(@Req() req: Request, @Param('id') id: string) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.parkingSlotService.putSlot(graphToken, id, req.body);
  }
}
