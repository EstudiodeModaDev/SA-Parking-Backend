import { Injectable } from "@nestjs/common";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { SettingsDTO } from "./dto/settings.dto.js";

@Injectable()
export class settingsService{

    private listName = 'Settings'

    constructor(private readonly graphRestService:GraphRestService){}

    async getSettings(graphToken :string){
        let response = await this.graphRestService.get(graphToken, this.listName, undefined)
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    private toModel(response:any): SettingsDTO{
        const f = response?.fields ?? {};
        return {
            ID: String(response?.id ?? ''),
            VisibleDays: (f.VisibleDays != null) ? String(f.VisibleDays) : '',
            InicioHorarioManana: (f.InicioHorarioMa_x00f1_ana != null) ? String(f.InicioHorarioMa_x00f1_ana) : '07:00',
            FinalManana: (f.FinalMa_x00f1_ana != null) ? String(f.FinalMa_x00f1_ana) : '12:00',
            InicioTarde: (f.InicioTarde != null) ? String(f.InicioTarde) : '12:00',
            FinalTarde: (f.FinalTarde != null) ? String(f.FinalTarde) : '18:00',
            TerminosyCondiciones: (f.TerminosyCondiciones != null) ? String(f.TerminosyCondiciones) : '',
            PicoPlaca: Boolean(f.PicoPlaca),
            Title : (f.Title != null)? String(f.Title) :''
            
        };
    }
}