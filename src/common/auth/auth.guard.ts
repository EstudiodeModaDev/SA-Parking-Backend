import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class TokenGuard extends PassportStrategy(Strategy, 'azure-token') {
  //se le asigno a la estrategia el nombre 'azure-token'
  // en el endpoint correspondiente se debera llamar al authguard de passport con el parametro 'azure-token' indicando que se usara la estrategia con ese nombre
  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('AZURE_CLIENT_ID');
    const tenantId = configService.get<string>('AZURE_TENANT_ID');
    super({
      // 1. Extrae el token del encabezado "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. No ignorar la expiración (por seguridad)
      ignoreExpiration: false,

      // 3. Algoritmo de firma esperado por Azure AD
      algorithms: ['RS256'],

      // 4. Configuración clave con jwks-rsa para apuntar a Azure AD
      secretOrKeyProvider: passportJwtSecret({
        cache: true, // Guarda en caché la clave pública para no saturar a Microsoft
        rateLimit: true, // Evita ataques de denegación por peticiones masivas
        jwksRequestsPerMinute: 5, // Límite de peticiones al endpoint por minuto
        jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      }),

      // 5. Validar la audiencia (el ID de tu API en Azure) y el emisor (Issuer)
      // Se acepta tanto el GUID puro como la App ID URI (api://<guid>) porque
      // Azure AD emite el claim `aud` en uno u otro formato segun como se
      // solicite el token (v1 vs scope de "Expose an API").
      audience: [clientId, `api://${clientId}`] as string[],
      issuer: `https://sts.windows.net/${tenantId}/`,
    });
  }
  async validate(payload: unknown) {
    return payload;
  }
}
