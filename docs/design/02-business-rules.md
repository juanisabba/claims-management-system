# 02 – Business Rules & Logic

## 1. Propósito

Este documento establece las invariantes de negocio y las restricciones operativas del sistema. Estas reglas rigen tanto la validación en el servidor (Integridad) como el comportamiento de la interfaz (UX).

---

## 2. Gestión de Siniestros (Claims)

### BR-01: Integridad del Estado

El ciclo de vida del Claim es unidireccional para estados finales.

- Un Claim en estado `Finished` es **inmutable**. No se permiten cambios en sus atributos ni en sus daños asociados.

### BR-02: Restricción de Edición (Mutabilidad)

- La gestión de Damages (Create, Update, Delete) está estrictamente permitida **únicamente** si el estado del Claim es `Pending`.
- **Excepción:** Si el Claim está en `In Review`, el sistema debe bloquear cualquier alteración de los importes o daños para garantizar la consistencia de la auditoría.

### BR-03: Cálculo del Total (Reactividad)

- El `Total Amount` de un Claim es un valor derivado: $\sum Damage.price$.
- **Requisito UI:** Cualquier cambio en la lista de daños (adición, borrado o cambio de precio) debe disparar un recálculo instantáneo en la interfaz sin necesidad de recargar la página o guardar manualmente.

---

## 3. Entidad de Daños (Damages)

### BR-04: Validación de Atributos Obligatorios

Para que un Damage sea persistido, debe cumplir con:

- **Part**: No vacío.
- **Severity**: Debe ser uno de los valores definidos (`low`, `mid`, `high`).
- **ImageUrl**: Debe ser una URL sintácticamente válida.
- **Price**: Valor numérico $\ge 0$.

---

## 4. Flujo de Transiciones y Guardas

### BR-05: Transiciones Permitidas

| Origen      | Destino     | Condición                         |
| :---------- | :---------- | :-------------------------------- |
| `Pending`   | `In Review` | Ninguna.                          |
| `In Review` | `Finished`  | Cumplir **BR-06**.                |
| `In Review` | `Pending`   | Si se requieren ajustes manuales. |

### BR-06: Guarda de Finalización (Regla de los 100 caracteres)

Para transicionar a `Finished`, el sistema aplica una validación de seguridad:

- **Regla:** Si el Claim contiene al menos un Damage cuya severidad sea considerada crítica (ej: severidad `high` o un daño total), la descripción general del Claim **debe tener una extensión superior a 100 caracteres**.
- **Propósito:** Asegurar que los peritos justifiquen adecuadamente los siniestros de alto impacto antes de cerrar el expediente.

---

## 5. Validación y Consistencia del Servidor

### BR-07: Sincronización de Totales

- Aunque el Frontend calcule el total para la UX, el Backend **debe** recalcular la suma de los daños antes de guardar cualquier cambio en la base de datos para evitar manipulaciones del cliente (Client-side tampering).

### BR-08: Validación de Estados Inconsistentes

- Cualquier petición REST que intente modificar un Damage vinculado a un Claim `Finished` debe retornar un error `403 Forbidden` o `409 Conflict`.

---

## 6. Matriz de Acciones por Estado

| Estado        | Ver Detalle | Añadir Daño | Editar Daño | Cambiar Estado |
| :------------ | :---------: | :---------: | :---------: | :------------: |
| **Pending**   |     ✅      |     ✅      |     ✅      |       ✅       |
| **In Review** |     ✅      |     ❌      |     ❌      |       ✅       |
| **Finished**  |     ✅      |     ❌      |     ❌      |       ❌       |
