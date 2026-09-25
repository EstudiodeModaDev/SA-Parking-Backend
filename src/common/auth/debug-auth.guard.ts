import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

// Estrategia SOLO para depuración: no usar en producción.
// Registra en consola cada paso de la validación del token para
// entender por qué el AuthGuard responde 401 Unauthorized.
//
// Uso: en el controlador, cambiar temporalmente
//   @UseGuards(AuthGuard('azure-token'))
// por
//   @UseGuards(AuthGuard('azure-token-debug'))
// y registrar DebugTokenGuard como provider en el módulo correspondiente.

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split('.')[1];
    const json = Buffer.from(payloadPart, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

@Injectable()
export class DebugTokenGuard extends PassportStrategy(
  Strategy,
  'azure-token-debug',
) {
  private readonly logger = new Logger('DebugTokenGuard');
  private readonly expectedAudiences: string[];
  private readonly expectedIssuer: string;

  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('AZURE_CLIENT_ID');
    const tenantId = configService.get<string>('AZURE_TENANT_ID');
    const audience = [clientId, `api://${clientId}`] as string[];
    const issuer = `https://sts.windows.net/${tenantId}/`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
        handleSigningKeyError: (err, cb) => {
          if (err) {
            console.error(
              '[DebugTokenGuard] Error obteniendo la clave publica (JWKS). ' +
                'Revisar AZURE_TENANT_ID y conectividad hacia login.microsoftonline.com:',
              err,
            );
          }
          cb(err);
        },
      }),
      audience,
      issuer,
    });

    this.expectedAudiences = audience;
    this.expectedIssuer = issuer;

    if (!clientId || !tenantId) {
      console.error(
        '[DebugTokenGuard] AZURE_CLIENT_ID o AZURE_TENANT_ID no estan definidos en la configuracion.',
      );
    }
  }

  authenticate(req: Request, options?: Record<string, unknown>) {
    console.log(
      '\n--- [DebugTokenGuard] Nueva peticion:',
      req.method,
      req.originalUrl,
      '---',
    );

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.error(
        '[DebugTokenGuard] No llego header "Authorization" en la peticion.',
      );
    } else if (!authHeader.startsWith('Bearer ')) {
      console.error(
        '[DebugTokenGuard] El header "Authorization" no tiene el formato "Bearer <token>". Valor recibido:',
        authHeader,
      );
    }

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      console.error(
        '[DebugTokenGuard] No se pudo extraer el token del header.',
      );
    } else {
      const payload = decodeJwtPayload(token);
      if (!payload) {
        console.error(
          '[DebugTokenGuard] El token recibido no es un JWT valido (no se pudo decodificar).',
        );
      } else {
        const exp = payload.exp as number | undefined;
        console.log(
          '[DebugTokenGuard] Claims del token (sin verificar firma todavia):',
          {
            aud: payload.aud,
            iss: payload.iss,
            exp,
            expDate: exp ? new Date(exp * 1000).toISOString() : undefined,
            nbf: payload.nbf,
            appid: payload.appid ?? payload.azp,
            scp: payload.scp,
            roles: payload.roles,
          },
        );
        console.log(
          '[DebugTokenGuard] Audiencias esperadas por el guard:',
          this.expectedAudiences,
        );
        console.log(
          '[DebugTokenGuard] Issuer esperado por el guard:',
          this.expectedIssuer,
        );

        if (!this.expectedAudiences.includes(payload.aud as string)) {
          console.error(
            `[DebugTokenGuard] POSIBLE CAUSA DEL 401 -> audience no coincide. Token trae aud="${payload.aud}", se esperaba una de ${JSON.stringify(this.expectedAudiences)}.`,
          );
        }
        if (payload.iss !== this.expectedIssuer) {
          console.error(
            `[DebugTokenGuard] POSIBLE CAUSA DEL 401 -> issuer no coincide. Token trae iss="${payload.iss}", se esperaba "${this.expectedIssuer}".`,
          );
        }
        if (exp && Date.now() >= exp * 1000) {
          console.error(
            '[DebugTokenGuard] POSIBLE CAUSA DEL 401 -> el token ya esta EXPIRADO.',
          );
        }
      }
    }

    return super.authenticate(req, options);
  }

  success(user: unknown, info: unknown) {
    console.log(
      '[DebugTokenGuard] Autenticacion EXITOSA.',
      info ? { info } : '',
    );
    super.success(user, info);
  }

  fail(challengeOrInfo: unknown, status?: number) {
    console.error(
      '[DebugTokenGuard] Autenticacion FALLIDA -> passport-jwt rechazo el token. Detalle:',
      challengeOrInfo,
      status !== undefined ? `status=${status}` : '',
    );
    super.fail(challengeOrInfo as string, status as number);
  }

  error(err: Error) {
    console.error(
      '[DebugTokenGuard] ERROR inesperado durante la autenticacion:',
      err,
    );
    super.error(err);
  }

  async validate(payload: unknown) {
    console.log(
      '[DebugTokenGuard] Firma, audience, issuer y expiracion verificados OK. Payload final:',
      payload,
    );
    return payload;
  }
}
