📋 Resumen de Reglas de Negocio (Business Rules)
El sistema se rige por tres pilares fundamentales: Integridad de Datos, Ciclo de Vida Restringido y Reactividad Financiera.

1. Gestión de Daños (Damages)
   Campos Obligatorios: No se puede crear un daño si falta la pieza (part), severidad, imagen y precio.

Precio: Siempre debe ser un valor numérico positivo.

2. Restricciones de Estado (State Guards)
   Edición Bloqueada: Solo se pueden agregar, editar o eliminar daños si el siniestro está en estado Pending.

Inmutabilidad: Una vez que un siniestro pasa a Finished, no se permite ninguna modificación (el registro queda "congelado").

Flujo de Trabajo: Un siniestro no puede saltar de Pending a Finished sin una validación de seguridad (típicamente pasando por una revisión).

3. La "Regla de Oro" (Justificación de Cierre)
   Para poder finalizar un siniestro (Finished), el sistema valida:

Si existe al menos un daño de severidad "High": La descripción general del siniestro debe tener más de 100 caracteres. Si es menor, la transición es rechazada por el dominio.

4. Consistencia y Reactividad
   Cálculo Automático: El monto total del siniestro es siempre la suma de los precios de sus daños.

Frontend Real-time: Cualquier cambio en un precio o la eliminación de un daño debe actualizar el total en la UI instantáneamente (uso de Angular Signals).

Validación de Servidor: El backend recalcula el total antes de persistir, ignorando cualquier valor total enviado por el cliente para evitar manipulaciones.
