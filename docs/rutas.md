# Rutas y endpoints

[← Volver al README](../README.md)

Todos los endpoints requieren el header `Authorization: Bearer <token de Azure AD>` y están protegidos por el guard `azure-token`. La columna **Roles** indica qué roles acepta el control de acceso del endpoint (ver [flujo de datos](flujo-de-datos.md#4-control-de-acceso-por-rol)).

La URL base es `http://<host>:<PORT>` (por defecto `http://localhost:3000`).

## `settings` — [documentación](rutas/settings.md)

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| GET | `/settings/get` | Admin, Usuario | Obtiene la configuración del parqueadero. |
| PUT | `/settings/put` | Admin | Actualiza la configuración (ítem con ID `1`). |

## `usuarios` — [documentación](rutas/usuarios.md)

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| GET | `/usuarios/getUsers` | Admin | Lista los usuarios registrados en la app. |
| GET | `/usuarios/getUsers?field=&value=` | Admin | Filtra usuarios por campo (ver nota en la documentación del router). |
| POST | `/usuarios/createUser` | Admin | Registra un usuario con su rol. |
| GET | `/usuarios/infoMe` | Cualquier token válido | Perfil del usuario autenticado en Microsoft Graph. |
| GET | `/usuarios/infoPhotoMe` | Cualquier token válido | Foto del usuario autenticado. |
| GET | `/usuarios/getRole` | Cualquier token válido | Rol del usuario autenticado (`Admin` o `Usuario`). |

## `colaboradores` — [documentación](rutas/colaboradores.md)

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| GET | `/colaboradores/fijos` | Admin | Lista los colaboradores fijos. |
| GET | `/colaboradores/fijos?field=&value=` | Admin | Filtra colaboradores fijos (ver nota en la documentación del router). |
| POST | `/colaboradores/createFijo` | Admin | Crea un colaborador fijo. |
| DELETE | `/colaboradores/deleteFijo/:id` | Admin | Elimina un colaborador fijo. |
| GET | `/colaboradores/mailList` | Admin | Miembros del grupo de Microsoft. |
| GET | `/colaboradores/userBy?email=` | Admin | Busca un miembro del grupo por correo. |
| POST | `/colaboradores/addUser?email=` | Admin | Agrega un usuario al grupo. |
| DELETE | `/colaboradores/remove?email=` | Admin | Quita un usuario del grupo. |
| GET | `/colaboradores/all` | Admin | Todos los usuarios de la compañía (Entra ID). |

## `parkingSlots` — [documentación](rutas/parking-slots.md)

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| GET | `/parkingSlots/getSlots` | Admin, Usuario | Celdas activas con su ocupación por turno. |
| POST | `/parkingSlots/createSlot` | Admin | Crea una celda. |
| PUT | `/parkingSlots/inactiveSlot/:id` | Admin | Marca una celda como `Inactiva`. |
| PUT | `/parkingSlots/activeSlot/:id` | Admin | Marca una celda como `Activa`. |
| PUT | `/parkingSlots/editSlot/:id` | Admin | Edita los campos de una celda. |

## `registro-vehicular` — [documentación](rutas/registro-vehicular.md)

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| GET | `/registro-vehicular` | Admin | Lista los registros vehiculares. |
| POST | `/registro-vehicular/create` | Admin | Crea un registro. |
| PUT | `/registro-vehicular/edit/:id` | Admin | Edita un registro. |
| DELETE | `/registro-vehicular/delete/:id` | Admin | Elimina un registro. |

## `reserva` — [documentación](rutas/reservas.md)

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| GET | `/reserva` | Admin, Usuario | Reservas activas (Admin: todas; Usuario: las propias). |
| GET | `/reserva/history` | Admin, Usuario | Historial de reservas (Admin: todas; Usuario: las propias). |
| POST | `/reserva/createQuickUsr` | Admin, Usuario | Reserva rápida para el usuario autenticado, con celda aleatoria. |
| POST | `/reserva/createQuickAdm` | Admin | Reserva rápida a nombre de otra persona, con celda aleatoria. |
| POST | `/reserva/createPuntUsr` | Admin, usuario | Reserva de una celda específica para el usuario autenticado. |
| POST | `/reserva/createPuntAdm` | Admin | Reserva de una celda específica a nombre de otra persona. |
| PUT | `/reserva/cancelReserv/:id` | Admin, Usuario | Cancela unicamente su propia reserva |

