# Exploración: Tiempo real y mejoras de chat

## Stack detectado

- **Framework**: Next.js 16.2.9 (App Router, Turbopack en dev).
- **Runtime / UI**: React 19.2.4, TypeScript 5, Tailwind CSS v4.
- **Base de datos**: PostgreSQL con Prisma 7.8.0 y adapter `@prisma/adapter-pg`.
- **Autenticación**: NextAuth v5 beta (`next-auth@5.0.0-beta.31`), estrategia JWT, credentials provider.
- **Tiempo real**: Pusher (`pusher` server + `pusher-js` client) ya instalado, pero sin variables de entorno configuradas en `.env`.
- **Otros**: Zod para validaciones, Sonner para toasts, Recharts para gráficos admin, Lucide para iconos.

## Archivos clave y roles

| Ruta absoluta | Rol |
|---------------|-----|
| `/home/mrcasco/Documentos/consultorio/prisma/schema.prisma` | Modelos `User`, `ProfessionalProfile`, `PatientProfile`, `Message`, `Appointment`, `Subscription`, etc. |
| `/home/mrcasco/Documentos/consultorio/lib/auth.ts` | Configuración de NextAuth (JWT, callbacks, roles). |
| `/home/mrcasco/Documentos/consultorio/lib/prisma.ts` | Singleton de PrismaClient con adapter pg. |
| `/home/mrcasco/Documentos/consultorio/lib/pusher.ts` | Cliente servidor de Pusher y `triggerMessage`. |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/page.tsx` | Dashboard admin: métricas, listado de validaciones pendientes, acciones de aprobación. |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/usuarios/page.tsx` | Gestión de usuarios (tabla con validar/desvalidar/eliminar). |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/usuarios/actions.ts` | `getAllUsers`, `deleteUser`, `toggleUserValidation`. |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/actions.ts` | `validateProfessional` / `rejectProfessional` usados desde el dashboard admin. |
| `/home/mrcasco/Documentos/consultorio/components/admin/validation-actions.tsx` | Botones cliente para aprobar/rechazar un profesional. |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/layout.tsx` | Layout del dashboard profesional/admin; obtiene `getUnreadMessageCount` y pasa `badge`. |
| `/home/mrcasco/Documentos/consultorio/components/layout/sidebar.tsx` | Sidebar con navegación por rol; muestra badges según configuración por ítem. |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/clientes/page.tsx` | Página de clientes: **placeholder**, no lista conversaciones ni clientes. |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/mensajes/page.tsx` | Listado de conversaciones + área de chat para profesional. |
| `/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/mensajes/chat-page.tsx` | Cliente que convierte la promesa de mensajes iniciales. |
| `/home/mrcasco/Documentos/consultorio/app/paciente/dashboard/mensajes/page.tsx` | Equivalente de mensajes para paciente. |
| `/home/mrcasco/Documentos/consultorio/components/chat/chat-panel.tsx` | Panel de chat con Pusher, optimistic UI, marcado como leído. |
| `/home/mrcasco/Documentos/consultorio/components/chat/chat-button.tsx` | Botón para iniciar chat desde perfil profesional. |
| `/home/mrcasco/Documentos/consultorio/app/messages/actions.ts` | Server actions: `sendMessage`, `getConversation`, `getUnreadMessageCount`, `markMessagesAsRead`, `getUserConversations`. |
| `/home/mrcasco/Documentos/consultorio/app/register/actions.ts` | Registro de pacientes/profesionales; crea `ProfessionalProfile` pendiente. |

## Resumen del schema relevante

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  role          UserRole  @default(PATIENT)
  patientProfile       PatientProfile?
  professionalProfile  ProfessionalProfile?
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}

model ProfessionalProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  licenseNumber  String?
  isValidated    Boolean   @default(false)
  isPremium      Boolean   @default(false)
  specialty      Specialty @default(NUTRITION)
  modality       Modality  @default(ONLINE)
  price          Float?
}

model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  content    String   @db.Text
  readAt     DateTime?
  createdAt  DateTime @default(now())
  sender     User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver   User     @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
}
```

No existe modelo `Conversation`; las conversaciones se derivan de `Message` con `groupBy` sobre `senderId`/`receiverId`.

## Hallazgo 1: flujo de agregar/validar profesional y falta de tiempo real

### Cómo funciona hoy

1. Un profesional se registra en `/register` (`app/register/actions.ts`), que crea un `User` con `role = PROFESSIONAL` y un `ProfessionalProfile` con `isValidated = false`.
2. El admin ve en `/profesional/dashboard` la lista de profesionales pendientes y puede aprobar/rechazar con `ValidationActions`.
3. También existe `/profesional/dashboard/usuarios` con una tabla completa; desde allí se puede validar/desvalidar o eliminar.
4. Las server actions `validateProfessional`, `rejectProfessional` y `toggleUserValidation` actualizan Prisma y llaman `revalidatePath`.

### Por qué no es "tiempo real"

- No hay suscripción cliente a eventos de profesionales. Si un profesional se registra en otra pestaña, el admin debe recargar para verlo.
- `validateProfessional` / `rejectProfessional` revalidan `/profesional/dashboard` y `/paciente/dashboard/expertos`, pero **no revalidan `/profesional/dashboard/usuarios`**. Si el admin está en la gestión de usuarios, la tabla no se refresca tras aprobar/desaprobar desde allí (aunque `toggleUserValidation` sí revalida esa ruta).
- No hay triggers Pusher para eventos de profesionales; solo existe `triggerMessage` para chat.
- La página `/profesional/dashboard/profesionales` es un placeholder vacío.

## Hallazgo 2: contador de mensajes no leídos

### Dónde está ahora

- `app/profesional/dashboard/layout.tsx` llama a `getUnreadMessageCount(session.user.id)` y pasa el número total a `DashboardShell` → `Sidebar`.
- En `components/layout/sidebar.tsx`, dentro del rol `PROFESSIONAL`, solo el ítem **Mensajes** define `badge: 0`. El sidebar aplica el badge global a ese ítem cuando `badge > 0`.
- Eso hace que el contador aparezca en **Mensajes**, no en **Clientes**.

### Qué falta para el modelo WhatsApp

- El badge debe moverse al ítem **Clientes** (total de mensajes no leídos) y, más importante, mostrarse **por conversación/cliente** dentro del listado de clientes.
- La función `getUnreadMessageCount` cuenta todos los mensajes no leídos globalmente (`receiverId = userId, readAt = null`), no agrupados por remitente.
- `getUserConversations` no devuelve ni el último mensaje ni la cuenta no leída por interlocutor.
- `markMessagesAsRead` actualiza Prisma pero no revalida el layout/sidebar, por lo que el badge no desaparece hasta recargar.
- Cuando llega un mensaje nuevo por Pusher, solo el `ChatPanel` activo lo agrega; el badge del sidebar y el listado de clientes no se actualizan.

## Errores y problemas encontrados

1. **Variables de entorno Pusher ausentes** (`/home/mrcasco/Documentos/consultorio/.env`)
   - No existen `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`.
   - `chat-panel.tsx` sale silenciosamente si falta `NEXT_PUBLIC_PUSHER_KEY`; el chat no es real-time sin configurar.

2. **Badge en ubicación incorrecto** (`/home/mrcasco/Documentos/consultorio/components/layout/sidebar.tsx`, línea 69)
   - `Mensajes` tiene `badge: 0`; `Clientes` no tiene badge. Contradice el requerimiento.

3. **Revalidación incompleta en acciones de validación** (`/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/actions.ts`, líneas 15-16)
   - No se revalida `/profesional/dashboard/usuarios`.

4. **Página de clientes vacía** (`/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/clientes/page.tsx`)
   - Es un placeholder; no muestra clientes ni conversaciones.

5. **Página de profesionales registrados vacía** (`/home/mrcasco/Documentos/consultorio/app/profesional/dashboard/profesionales/page.tsx`)
   - Placeholder; no lista profesionales.

6. **Uso de `session!` sin protección** (varias páginas, ej. `app/profesional/dashboard/page.tsx` línea 23, `app/profesional/dashboard/mensajes/page.tsx` línea 18)
   - Si no hay sesión, explota en runtime. No existe `middleware.ts` de protección.

7. **Canales Pusher públicos**
   - El canal `chat-${idsSorted}` es público; cualquier usuario que conozca los IDs puede suscribirse. Deberían ser canales privados/autorizados.

8. **Warnings de ESLint** (`npm run lint`)
   - 9 warnings por `session` asignado pero no usado en múltiples páginas placeholder.

9. **Modelo `Message` sin índices**
   - Consultas frecuentes por `(senderId, receiverId, readAt)` no están indexadas; escalará mal.

## Riesgos técnicos

- **Sin tests**: no hay runner configurado; verificación depende de `build` y `typecheck`.
- **NextAuth v5 beta**: API inestable; cambios futuros pueden romper callbacks/JWT.
- **Next.js 16 breaking changes**: debe consultarse `node_modules/next/dist/docs/` antes de escribir código nuevo.
- **Tiempo real en App Router**: los Server Components no reciben push; cualquier actualización en tiempo real requiere un Client Component que escuche Pusher y llame `router.refresh()` o mutación local.
- **Riesgo de seguridad**: canales Pusher públicos y ausencia de middleware de autenticación.
- **Consistencia de badges**: sin un único estado global de unread counts en el cliente, el badge del sidebar y la lista de clientes pueden desincronizarse.

## Recomendación de próximos pasos (no implementar)

1. **Configurar Pusher**: agregar las variables de entorno faltantes y decidir si se usan canales privados.
2. **Tiempo real para admin**:
   - Emitir eventos Pusher `professional-registered` y `professional-validated` desde `registerUser`, `validateProfessional`, `rejectProfessional` y `toggleUserValidation`.
   - En las páginas admin (`/profesional/dashboard` y `/profesional/dashboard/usuarios`), agregar un Client Component que escuche `admin-updates` y llame `router.refresh()` o actualice SWR.
3. **Badge por conversación**:
   - Crear `getUnreadCountsBySender(receiverId)` que agrupe `Message` por `senderId` donde `receiverId = userId` y `readAt = null`.
   - Reemplazar el listado de conversaciones en mensajes y la página de clientes para mostrar el contador por cliente.
   - Mover el badge global del sidebar del ítem **Mensajes** al ítem **Clientes**.
   - Añadir un listener Pusher por usuario (`user-{id}`) para actualizar los contadores en cliente sin recargar.
4. **Corregir revalidaciones**: incluir `/profesional/dashboard/usuarios` en las server actions de validación.
5. **Considerar middleware de autenticación** y protección de rutas para evitar `session!` y accesos no autorizados.
6. **Agregar índices Prisma** para consultas de mensajes por `(receiverId, readAt)` y `(senderId, receiverId)`.

## Estado de listo para propuesta

Sí. Hay suficiente información para pasar a `sdd-propose` con scopes claros:
- Tiempo real en el panel admin (registro/validación de profesionales).
- Refactor del contador de mensajes no leídos: por cliente, en el listado de clientes, y badge en sidebar.
- Fixes de revalidación y config de Pusher.
