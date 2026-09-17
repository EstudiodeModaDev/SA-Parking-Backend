import { Injectable } from "@nestjs/common";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { SettingsDTO } from "./dto/settings.dto.js";

@Injectable()
export class settingsService{

    private listName = 'Parking-Settings'

    constructor(private readonly graphRestService:GraphRestService){}

    async getSettings(graphToken :string){
        let response = await this.graphRestService.get(graphToken, this.listName, undefined)
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    async putSettings(graphToken:string, data:SettingsDTO){
        let itemsList: SettingsDTO[]= await this.getSettings(graphToken)
        let itemSearched: SettingsDTO | undefined = itemsList.find( item => item.ID == "1")
        //Manejo de errores
        if (itemSearched == undefined) throw new Error("No se encontro el objeto especificado")
        let response = await this.graphRestService.update(graphToken, itemSearched?.ID,data,this.listName )
        return response
    }

    private toModel(response:any): SettingsDTO{
        const f = response?.fields ?? {};
        return {
            ID: String(response?.id ?? ''),
            VisibleDays: (f.VisibleDays != null) ? String(f.VisibleDays) : '',
            InicioHorarioMa_x00f1_ana: (f.InicioHorarioMa_x00f1_ana != null) ? String(f.InicioHorarioMa_x00f1_ana) : '07:00',
            FinalMa_x00f1_ana: (f.FinalMa_x00f1_ana != null) ? String(f.FinalMa_x00f1_ana) : '12:00',
            InicioTarde: (f.InicioTarde != null) ? String(f.InicioTarde) : '12:00',
            FinalTarde: (f.FinalTarde != null) ? String(f.FinalTarde) : '18:00',
            TerminosyCondiciones: (f.TerminosyCondiciones != null) ? String(f.TerminosyCondiciones) : '',
            PicoPlaca: Boolean(f.PicoPlaca),
            Title : (f.Title != null)? String(f.Title) :''
        };
    }
}