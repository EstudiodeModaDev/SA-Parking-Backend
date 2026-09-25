# Router `settings`

[← Rutas y endpoints](../rutas.md) · [Flujo de datos](../flujo-de-datos.md)

Configuración general del parqueadero: días visibles para reservar, horarios de los turnos, términos y condiciones y pico y placa.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| [settings.controller.ts](../../src/routes/settings/settings.controller.ts) | Endpoints y roles. |
| [settings.service.ts](../../src/routes/settings/settings.service.ts) | Lectura y actualización en SharePoint. |
| [settings.module.ts](../../src/routes/settings/settings.module.ts) | Dependencias del router. |
| [dto/settings.dto.ts](../../src/routes/settings/dto/settings.dto.ts) | `SettingsDTO`. |

**Lista de SharePoint:** `SETTINGS_LIST_NAME`

## Endpoints

### `GET /settings/get`

- **Roles:** Admin, Usuario
- **Controller:** `getSettings` — [settings.controller.ts:24](../../src/routes/settings/settings.controller.ts#L24)
- **Service:** `getSettings` — [settings.service.ts:15](../../src/routes/settings/settings.service.ts#L15)
- **Lógica:** trae todos los ítems de la lista y los mapea con `toModel`, que asigna valores por defecto a los horarios si vienen vacíos (mañana `07:00–12:00`, tarde `12:00–18:00`).
- **Respuesta:** `SettingsDTO[]`

### `PUT /settings/put`

- **Roles:** Admin
- **Controller:** `putSettings` — [settings.controller.ts:37](../../src/routes/settings/settings.controller.ts#L37)
- **Service:** `putSettings` — [settings.service.ts:21](../../src/routes/settings/settings.service.ts#L21)
- **Body:** campos de `SettingsDTO` a modificar.
- **Lógica:** busca el ítem con `ID == "1"` (la configuración es un único registro) y le aplica un `update` con el body recibido.
- **Respuesta:** campos actualizados, tal como los devuelve Graph.

## Modelo `SettingsDTO`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `ID` | string | ID del ítem en SharePoint. |
| `Title` | string | Título del registro. |
| `VisibleDays` | string | Días hacia adelante en los que se puede reservar. |
| `InicioHorarioMa_x00f1_ana` / `FinalMa_x00f1_ana` | string | Horario del turno de mañana (`ñ` codificada por SharePoint). |
| `InicioTarde` / `FinalTarde` | string | Horario del turno de tarde. |
| `TerminosyCondiciones` | string | Texto de términos y condiciones. |
| `PicoPlaca` | boolean | Si aplica pico y placa. |

## Observaciones

- Si no existe el ítem con ID `1`, `putSettings` lanza un `Error` genérico, que llega al cliente como **500** en vez de **404**.
