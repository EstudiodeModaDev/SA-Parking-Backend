import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";
import { logService } from "./log.service.js";

// filtro global: atrapa cualquier error lanzado en los endpoints, lo registra
// en la lista de logs y responde al cliente con el mismo formato de nest
@Catch()
export class logExceptionFilter implements ExceptionFilter{
    constructor(private readonly logService:logService){}

    async catch(exception: unknown, host: ArgumentsHost){
        const ctx = host.switchToHttp()
        const req = ctx.getRequest<Request>()
        const res = ctx.getResponse<Response>()

        const isHttp = exception instanceof HttpException
        const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
        const message = (exception as any)?.message ?? String(exception)
        // los errores que no son HttpException (ej. axios contra Graph) no se exponen al cliente
        const body = isHttp
            ? exception.getResponse()
            : { statusCode: status, message: 'Internal server error' }

        const tipoLog = status >= 500 ? 'ERROR' : 'WARN'
        // una columna de texto de una linea en SharePoint admite maximo 255 caracteres
        const mensaje = `${req.method} ${req.originalUrl} - ${message}`.slice(0, 255)

        // el token de graph solo existe si el endpoint alcanzo a hacer el OBO,
        // sin el no hay como escribir en SharePoint (ej. token de azure invalido)
        const graphToken = (req as any).graphToken as string | undefined
        if(graphToken)
            await this.logService.sendLog(graphToken, { TipoLog: tipoLog, Codigo: String(status), Mensaje: mensaje, Fecha: new Date().toISOString() })

        res.status(status).json(typeof body === 'string' ? { statusCode: status, message: body } : body)
    }
    
}
