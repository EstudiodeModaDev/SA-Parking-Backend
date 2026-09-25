# SA-Parking Backend

API REST del sistema de parqueadero de **Estudio de Moda**. Está construida con [NestJS](https://nestjs.com/) y no tiene base de datos propia: toda la información vive en **listas de SharePoint** y en **Microsoft Entra ID (Azure AD)**, y se consulta a través de **Microsoft Graph**.

## Documentación

| Documento | Contenido |
| --- | --- |
| [Rutas y endpoints](docs/rutas.md) | Listado completo de endpoints: método, ruta, roles permitidos y enlace a su documentación. |
| [Flujo de datos](docs/flujo-de-datos.md) | Recorrido genérico de una petición desde que llega hasta que responde. |
| [Router `settings`](docs/rutas/settings.md) | Configuración general del parqueadero. |
| [Router `usuarios`](docs/rutas/usuarios.md) | Usuarios registrados en la app, roles e información del usuario autenticado. |
| [Router `colaboradores`](docs/rutas/colaboradores.md) | Colaboradores fijos y gestión del grupo de Microsoft. |
| [Router `parkingSlots`](docs/rutas/parking-slots.md) | Celdas de parqueo y su ocupación por turno. |
| [Router `registro-vehicular`](docs/rutas/registro-vehicular.md) | Registro de vehículos. |
| [Router `reserva`](docs/rutas/reservas.md) | Creación, consulta y cancelación de reservas. |

## Arquitectura en resumen

```
Frontend (SA-Parking) ──Bearer token de Azure AD──▶ Backend NestJS ──token OBO──▶ Microsoft Graph ──▶ SharePoint / Entra ID
```

1. El frontend envía el token de Azure AD del usuario en el header `Authorization`.
2. El guard `azure-token` valida la firma, la audiencia, el emisor y la expiración del token.
3. El backend cambia ese token por uno de Microsoft Graph usando el flujo **On-Behalf-Of** (OBO).
4. Se verifica el rol del usuario (`Admin` o `Usuario`) contra la lista de usuarios de SharePoint o el grupo de Microsoft.
5. El service del router ejecuta la lógica y lee o escribe en SharePoint mediante `GraphRestService`.

El detalle está en [docs/flujo-de-datos.md](docs/flujo-de-datos.md).

## Estructura del proyecto

```
src/
├── main.ts                     # Arranque de la app (puerto PORT o 3000)
├── app.module.ts               # Módulo raíz: registra todos los routers
├── common/                     # Servicios compartidos por todos los routers
│   ├── auth/                   # Estrategias de Passport (validación del token de Azure AD)
│   ├── OnBehalfOf/             # Cambio de token del usuario → token de Graph
│   ├── access/                 # Control de acceso por rol
│   └── graph/                  # Cliente de Microsoft Graph (listas de SharePoint, grupos, usuarios)
└── routes/                     # Un directorio por router
    └── <router>/
        ├── <router>.controller.ts   # Define endpoints, guard y roles permitidos
        ├── <router>.service.ts      # Lógica de negocio y mapeo de datos
        ├── <router>.module.ts       # Declara dependencias del router
        └── dto/                     # Tipos de los datos de entrada y salida
```

## Variables de entorno

Se cargan con `@nestjs/config` desde un archivo `.env` en la raíz.

| Variable | Uso |
| --- | --- |
| `AZURE_TENANT_ID` | Tenant de Azure AD. Se usa para validar tokens y para el flujo OBO. |
| `AZURE_CLIENT_ID` | ID de la app registrada en Azure (audiencia esperada del token). |
| `AZURE_SECRET` | Secreto de la app, usado en el flujo OBO. |
| `SHARE_POINT_SITE_URL` | URL del sitio de SharePoint donde viven las listas. |
| `OUTLOOK_GROUP_ID` | ID del grupo de Microsoft cuyos miembros tienen rol `Usuario`. |
| `SETTINGS_LIST_NAME` | Nombre de la lista de configuración. |
| `USUARIOS_PARKING_LIST_NAME` | Nombre de la lista de usuarios y roles. |
| `COLABORADORES_FIJOS_LIST_NAME` | Nombre de la lista de colaboradores fijos. |
| `PARKING_SLOTS_LIST_NAME` | Nombre de la lista de celdas de parqueo. |
| `RESERVAS_LIST_NAME` | Nombre de la lista de reservas. |
| `REGISTRO_VEHICULAR_LIST_NAME` | Nombre de la lista de registro vehicular. |

## Scripts

```bash
npm install          # instalar dependencias
npm run start:dev    # desarrollo con recarga automática
npm run build        # compilar a dist/
npm run start:prod   # ejecutar la versión compilada
npm run lint         # oxlint
npm run test         # pruebas unitarias (vitest)
npm run test:e2e     # pruebas end-to-end
```

## Agregar un router nuevo

1. Crear `src/routes/<nombre>/` con controller, service, module y `dto/`.
2. En el module, importar `OnBehalfOfModule`, `GraphRestModule` y `AccessModule`.
3. En cada endpoint, seguir el patrón descrito en [docs/flujo-de-datos.md](docs/flujo-de-datos.md#patrón-de-un-endpoint).
4. Registrar el module en [src/app.module.ts](src/app.module.ts).
5. Documentar los endpoints en [docs/rutas.md](docs/rutas.md) y crear su archivo en `docs/rutas/`.
