# Consultorio
Documento de Requisitos del Producto

1. Nombres Propuestos
Kineo: Movimiento y nutrición, sin complicaciones.
Vital 360: Tu salud, desde todos los ángulos.
Salud integral: Todo tu bienestar, en un solo lugar.

2. Descripción General
Plataforma web diseñada para unificar el expediente clínico y físico del paciente. Permite a nutriólogos y entrenadores acceder de forma controlada a la información de su disciplina, ofreciendo al paciente herramientas de autocuidado y seguimiento profesional constante.

3. Público Objetivo
Pacientes: Personas enfocadas en mejorar su salud, nutrición o condición física.
Nutriólogos: Profesionales dedicados a brindar planes de alimentación personalizados.
Entrenadores: Profesionales especializados en el diseño de rutinas físicas a medida.

A. Experiencia y Pagos del Paciente 
El paciente no paga suscripción a la plataforma para obtener servicios humanos; paga directamente por los servicios que contrata.
Nivel
Beneficios y Funcionalidades
 
Básico (Gratis)
Registro de datos básicos (peso, altura, tipo de sangre). 1 registro de calorías diario por texto. Acceso a rutinas y dietas genéricas ("muestras gratis" subidas por los profesionales).
Contratación de Servicios
El paciente paga el precio fijado por el nutriólogo o entrenador a través del guía de expertos para recibir dietas, rutinas hechas a medida según su somatotipo/ubicación y seguimiento 1 a 1.
Premium de Software (Opcional)
(Futura actualización): Suscripción para desbloquear funciones de la app como: Contador de calorías ilimitado, registro de comidas por foto con IA.


B. Suscripción para Profesionales 
Esta es la principal fuente de ingresos recurrentes de la plataforma.
Nivel
Beneficios y Funcionalidades
 
Básico (Gratis)
Perfil básico en el guía de expertos. Capacidad reducida para atender a un número pequeño de pacientes (ej. máximo 3 pacientes activos). Posibilidad de publicar "dietas/rutinas" para atraer clientes.
Premium (Suscripción)
Pago mensual o anual a la plataforma. Perfil destacado en el guía de expertos (Publicidad/Visibilidad). Mayor capacidad de pacientes (ilimitados). Videollamadas, plantillas y estadísticas avanzadas.


5. Estructura tipo Guía de Expertos
Perfiles Públicos: Los profesionales publican su especialidad, ubicación, modalidad (online/presencial) y precios de sus asesorías.
Exploración: Los pacientes buscan, filtran y consultan precios de manera gratuita.

6. Roles y Permisos
Rol
Permisos Principales
 
Paciente
Ver dietas y rutinas. Registrar datos, medidas y calorías. Subir documentos médicos. Buscar profesionales y agendar citas. Usar el chat.
Nutriólogo
Crear planes de alimentación. Revisar alergias, restricciones y documentos médicos del paciente. Monitorear progreso. Gestionar chat y agenda. (Requiere validación de cédula).
Entrenador
Crear rutinas físicas. Leer restricciones biomecánicas en el expediente. Monitorear progreso. Gestionar chat y agenda. (Requiere validación de certificación).





7. Funcionalidades Principales
Autenticación Única: Un solo inicio de sesión con selección de rol.
Validación de Profesionales: Carga de documentos con extracción de datos automática (OCR) y aprobación humana.
Gestión de Perfil: Historial médico, documentos y seguimiento de objetivos (peso y medidas).
Seguimiento Nutricional: Contador de calorías y registro de comidas.
Entrenamiento: Catálogo de rutinas genéricas y personalizadas.
Guía de Expertos: Motor de búsqueda de especialistas con filtros de ciudad, especialidad y modalidad.
Agenda Digital: Configuración de disponibilidad para profesionales y solicitud de turnos para pacientes.
Comunicación: Chat interno integrado y opción de enlace a WhatsApp.

8. Stack Tecnológico
Frontend: Next.js o TypeScript.
Backend: Next.js API Routes o NestJS/Node.js.
Base de Datos: PostgreSQL.
Pasarela de Pagos (Futuro): Stripe o Mercado Pago (Fundamental para gestionar las suscripciones de los profesionales y los pagos de pacientes a expertos).






9. Flujos de Usuario
Experiencia del Paciente
Registro en la plataforma y selección de rol.
Ingreso de datos básicos y metas de salud.
Uso de herramientas gratuitas y consumo de "rutinas base" 
Búsqueda de especialistas en el guía de expertos.
Consulta de servicios, solicitud de cita y pago por asesoría personalizada.
Recepción de confirmación por parte del profesional.
Visualización del plan de salud personalizado y seguimiento de métricas.
Renovación de servicios o contratación de nuevas asesorías.
Experiencia del Profesional
Registro y selección de especialidad.
Carga de documentación oficial para validación.
Aprobación de la cuenta por parte de un administrador.
Configuración del perfil público, precios, horarios y carga de contenido gratuito (rutinas/dietas genéricas).
Gestión de sus primeros pacientes gratuitos (Límite: 3).
Punto de Conversión: El profesional paga la suscripción Premium para desbloquear clientes ilimitados y obtener perfil destacado.
Recepción y gestión de solicitudes de pacientes.
Confirmación de citas y diseño de planes a medida.
Seguimiento y comunicación continua vía chat.






10. Seguridad y Privacidad
Autenticación blindada y control de acceso estricto según el rol.
Cumplimiento normativo alineado a la Ley General de Salud y la LFPDPPP (México).
Privacidad garantizada: Solo el profesional asignado visualiza los datos relevantes de su área.

11. Fases de Desarrollo
Alcance del MVP
Registro unificado y selección de rol.
Validación manual de profesionales apoyada por OCR.
Perfil de paciente con registro de evolución.
Contador de calorías básico.
Guía de Expertos activo con sistema de agendamiento y exposición de perfiles.
Chat interno de comunicación.
Habilitación de modelo de suscripción premium para Profesionales.
Versiones Futuras
Sistema de videollamadas nativo.
Inteligencia Artificial para reconocimiento calórico por fotografías (Suscripción Premium de software para pacientes).
Pasarela de pagos interna.
Aplicación móvil (Nativa o PWA).

---

## Notas de la Beta

Esta rama contiene la versión beta del producto. El objetivo es validar la propuesta de valor con un flujo funcional mínimo antes de invertir en funciones avanzadas.

### Nombre elegido para el descubrimiento de especialistas
Se reemplazó el término genérico **Marketplace** por **Guía de Expertos** para evitar confusiones de marca y derechos de autor.

### Alcance implementado en la beta
- Proyecto Next.js 16 + TypeScript + Tailwind CSS.
- Esquema inicial de PostgreSQL con Prisma (usuarios, perfiles, citas, mensajes, entradas de calorías, suscripciones y validaciones).
- Rutas de navegación: landing, login, registro, panel de paciente, panel de profesional, Guía de Expertos y detalle de profesional.
- Estructura base de autenticación con NextAuth.js (faltan providers y flujo completo de registro).

### Pendiente para próximas iteraciones
- Providers de autenticación (email/password u OAuth).
- Registro real y guardado de perfiles.
- Agendamiento funcional con calendario.
- Chat interno.
- Validación de documentos de profesionales (OCR + revisión humana).
- Pasarela de pagos (Stripe / Mercado Pago).
- Contador de calorías con límite diario para usuarios gratuitos.
- Pruebas automatizadas.

---

## Setup local

1. Clonar el repo e instalar dependencias:
   ```bash
   npm install
   ```

2. Crear una base de datos PostgreSQL local (por ejemplo, `consultorio`).

3. Copiar el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Configurar `DATABASE_URL` en `.env` con tus credenciales de Postgres.

5. Generar el cliente de Prisma y aplicar migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

7. Abrir [http://localhost:3000](http://localhost:3000).

### Requisitos
- Node.js 20 o superior (recomendado 22+).
- PostgreSQL 14 o superior.

