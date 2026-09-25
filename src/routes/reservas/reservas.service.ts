import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GraphRestService } from '../../common/graph/graphRest.service.js';
import { ConfigService } from '@nestjs/config';
import { ReservasDTO } from './dto/reservas.dto.js';
import { ParkingSlotsService } from '../parkingSlots/parkingSlots.service.js';
import { ParkingSlotDTO } from '../parkingSlots/dto/ParkingSlots.dto.js';
import { esTurnoValido, TURNOS, turnoDisponible } from '../parkingSlots/turnos.js';
import { fechaHoy, normalizarFecha } from '../parkingSlots/fechas.js';

@Injectable()
export class reservasService {
  private listName: string;
  constructor(
    private readonly graphRestService: GraphRestService,
    private readonly configService: ConfigService,
    private readonly slotsService : ParkingSlotsService 
  ) {
    this.listName = String(configService.get('RESERVAS_LIST_NAME'));
  }

  async getUserHistory(graphToken: string, correo: string) {
    const response = await this.graphRestService.getFiltred(
      graphToken,
      this.listName,
      [{ field: 'UserEmail', value: correo }],
    );
    const array = Array.isArray(response?.value) ? response.value : [];
    return array.map((x: any) => this.toModel(x));
    
  }

  async getUserActive(graphToken: string, correo: string) {
    const response = await this.graphRestService.getFiltred(
      graphToken,
      this.listName,
      [
        { field: 'Title', value: correo },
        { field: 'Status', value: 'Activa' },
      ],
    );
    const array = Array.isArray(response?.value) ? response.value : [];
    return array.map((x: any) => this.toModel(x));
  }

  async getAllHistory(graphToken: string) {
    const response = await this.graphRestService.get(graphToken, this.listName);
    const array = Array.isArray(response?.value) ? response.value : [];
    return array.map((x: any) => this.toModel(x));
  }

  async getAllActive(graphToken: string) {
    const response = await this.graphRestService.getFiltred(
      graphToken,
      this.listName,
      [{ field: 'Status', value: 'Activa' }],
    );
    const array = Array.isArray(response?.value) ? response.value : [];
    return array.map((x: any) => this.toModel(x));
  }

  async createQuickUsuario(graphToken: string, sended: any, email:string, name:string) {
    const fecha = this.validarDatosReserva(sended)
    const SpotId = await this.reservRandomSlot(graphToken, sended.VehicleType, sended.Turn, fecha)
    const data = {
        Title : email,
        NombreUsuario : name,
        Turn : sended.Turn,
        Status : "Activa",
        VehicleType: sended.VehicleType,
        Date : sended.Date,
        Codigo: sended.Codigo,
        Notify: sended.Notify,
        SpotId : SpotId
    }
    const response = await this.graphRestService.create(
      graphToken,
      data,
      this.listName,
    );
    return response.fields;
  }

  async createQuickAdmin(graphToken:string, sended:any){
    const fecha = this.validarDatosReserva(sended)
    const SpotId = await this.reservRandomSlot(graphToken, sended.VehicleType, sended.Turn, fecha)
    const data = {
        Title : sended.Title,
        NombreUsuario : sended.NombreUsuario,
        Turn : sended.Turn,
        Status : "Activa",
        VehicleType: sended.VehicleType,
        Date : sended.Date,
        Codigo: sended.Codigo,
        Notify: sended.Notify,
        SpotId : SpotId
    }
    const response = await this.graphRestService.create(
      graphToken,
      data,
      this.listName,
    );
    return response.fields;
  }

  async createPuntualUsr(graphToken:string, sended:any, email:string, name:string){
    const fecha = this.validarDatosReserva(sended)
    await this.validarCeldaPuntual(graphToken, sended.SpotId, sended.VehicleType, sended.Turn, fecha)
    let data = {
      Title : email,
      NombreUsuario : name,
      Turn : sended.Turn,
      Status : "Activa",
      VehicleType: sended.VehicleType,
      Date : sended.Date,
      Codigo: sended.Codigo,
      Notify: sended.Notify,
      SpotId : sended.SpotId
    }
    const response = await this.graphRestService.create(
      graphToken,
      data,
      this.listName,
    );
    return response.fields;
  }
  async createPuntualAdm(graphToken:string, sended:any){
    const fecha = this.validarDatosReserva(sended)
    await this.validarCeldaPuntual(graphToken, sended.SpotId, sended.VehicleType, sended.Turn, fecha)
    let data = {
      Title : sended.Title,
      NombreUsuario : sended.NombreUsuario,
      Turn : sended.Turn,
      Status : "Activa",
      VehicleType: sended.VehicleType,
      Date : sended.Date,
      Codigo: sended.Codigo,
      Notify: sended.Notify,
      SpotId : sended.SpotId
    }
    const response = await this.graphRestService.create(
      graphToken,
      data,
      this.listName,
    );
    return response.fields;
  }

  async cancelUsr(graphToken:string, id:string, email:string){
    const listUserReserv = await this.getUserActive(graphToken, email) as ReservasDTO[]
    if(listUserReserv.find(reserv => reserv.ID === id) === undefined) 
      throw new BadRequestException('La reserva no pertenece a este usuario o ya esta cancelada')
    else
      return this.graphRestService.update(graphToken, id,{'Status': 'Cancelada'}, this.listName )
  }

  // devuelve la fecha de la reserva normalizada a YYYY-MM-DD
  private validarDatosReserva(sended:any): string{
    if(!esTurnoValido(sended?.Turn)){
        throw new BadRequestException(`Turno invalido, debe ser uno de: ${TURNOS.join(', ')}`)
    }
    if(sended?.VehicleType !== 'Carro' && sended?.VehicleType !== 'Moto'){
        throw new BadRequestException('Tipo de vehiculo invalido, debe ser Carro o Moto')
    }
    const fecha = normalizarFecha(sended?.Date)
    if(!fecha){
        throw new BadRequestException('Fecha invalida, debe tener formato YYYY-MM-DD')
    }
    if(fecha < fechaHoy()){
        throw new BadRequestException('No se puede reservar en una fecha pasada')
    }
    return fecha
  }

  private async validarCeldaPuntual(graphToken:string, spotId:string, vehicleType: ReservasDTO['VehicleType'], turn: ReservasDTO['Turn'], fecha: string){
    if(!spotId){
        throw new BadRequestException('Debe indicar la celda (SpotId) a reservar')
    }
    const slot = await this.slotsService.getSlotByTitle(graphToken, spotId, fecha)
    if(!slot){
        throw new NotFoundException(`La celda ${spotId} no existe`)
    }
    if(slot.Activa !== 'Activa'){
        throw new ConflictException(`La celda ${spotId} no esta activa`)
    }
    if(slot.TipoCelda !== vehicleType){
        throw new BadRequestException(`La celda ${spotId} es para ${slot.TipoCelda}, no se puede reservar para ${vehicleType}`)
    }
    if(!turnoDisponible(slot.Ocupacion, turn)){
        throw new ConflictException(`La celda ${spotId} ya esta reservada para el turno ${turn} el ${fecha}`)
    }
  }

  private async reservRandomSlot(graphToken:string, vehicleType: ReservasDTO['VehicleType'], turn: ReservasDTO['Turn'], fecha: string){
    const arraySlots: Array<ParkingSlotDTO> = await this.slotsService.getParkingSlots(graphToken, fecha)
    // solo celdas del tipo de vehiculo solicitado que esten libres en el turno solicitado
    const libres = arraySlots.filter(slot => slot.TipoCelda === vehicleType && turnoDisponible(slot.Ocupacion, turn))
    if(libres.length === 0){
        throw new ConflictException(`No hay celdas disponibles para ${vehicleType} en el turno ${turn} el ${fecha}`)
    }
    const random = Math.floor(Math.random()*libres.length)
    return libres[random].Title
  }

  private toModel(response: any): ReservasDTO {
    const f = response?.fields ?? {};
    return {
      ID: f.id,
      Title: f.Title,
      Creadopor: f.Creadopor,
      NombreUsuario: f.NombreUsuario,
      Turn: f.Turn,
      SpotId: f.SpotId,
      Status: f.Status,
      VehicleType: f.VehicleType,
      Date: f.Date,
      Creado: f.Creado,
      Codigo: f.Codigo,
      Notify: f.Notify,
    };
  }
}
