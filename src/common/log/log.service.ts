import { Injectable, Logger } from "@nestjs/common";
import { GraphRestService } from "../graph/graphRest.service.js";
import { ConfigService } from "@nestjs/config";

export class logDTO{
    TipoLog : "WARN" | "LOG" | "ERROR"
    Codigo : string
    Mensaje : string
    Fecha : string
    
}

@Injectable()
export class logService{
    private listName : string
    private readonly logger = new Logger(logService.name)

    constructor(private readonly graphRestService:GraphRestService, private readonly configService:ConfigService){
        this.listName = String(configService.get('LOG_LIST_NAME'))
    }

    // guarda el log en la lista de SharePoint; si falla solo se escribe en consola
    // para que un error al loguear nunca rompa la respuesta del endpoint
    async sendLog(graphToken:string, data:logDTO){
        try{
            await this.graphRestService.create(graphToken, data, this.listName)
        }catch(error: any){
            // axios solo dice "Request failed with status code X", el motivo real viene en el body de Graph
            const status = error?.response?.status ?? error?.status
            const detalle = error?.response?.data?.error?.message ?? error?.message
            this.logger.error(`No se pudo guardar el log en SharePoint (${status}): ${detalle}`)
        }
    }
}
