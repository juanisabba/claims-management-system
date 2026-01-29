# 04 – Design Patterns & Implementation Strategy

## 1. Propósito

Este documento justifica los patrones de diseño seleccionados para garantizar que el sistema cumpla con los principios **SOLID**, sea altamente testeable (objetivo >95% coverage) y cumpla con los requisitos de reactividad.

---

## 2. State Pattern (Behavioral) - Business Logic Core

Este es el patrón principal aplicado a la lógica de negocio para gestionar el ciclo de vida del `Claim`.

### 2.1 Problema

Las reglas de negocio dictan que las operaciones (añadir daños, finalizar siniestro) dependen del estado actual. Un enfoque basado en `if/else` o `switch` violaría el **Open/Closed Principle** y dificultaría el testing de casos de borde.

### 2.2 Solución

Cada estado (`PendingState`, `InReviewState`, `FinishedState`) implementa la interfaz `ClaimStatusState`.

- **Encapsulación de Reglas:** La lógica de la "Regla de los 100 caracteres" se implementa dentro del método `transitionToFinished()` de la clase de estado correspondiente.
- **Seguridad:** Si un usuario intenta añadir un `Damage` mientras el objeto está en `FinishedState`, el propio objeto de estado lanza un error de dominio.

---

## 3. Repository Pattern (Structural) - Data Abstraction

### 3.1 Problema

El requerimiento exige el uso de **Dependency Injection (DI)**. Acoplar los servicios directamente a Mongoose impediría el uso de DI de forma efectiva.

### 3.2 Solución

Implementamos `IClaimRepository` como un **Port** (interfaz) en la capa de dominio.

- La implementación concreta (`MongoClaimRepository`) reside en la capa de infraestructura.
- **DI:** El `ClaimService` recibe la interfaz en su constructor, permitiendo inyectar un `MockClaimRepository` durante los tests unitarios para alcanzar el 95% de cobertura sin latencia de base de datos.

---

## 4. Observer / Signal Pattern (Frontend Reactivity)

### 4.1 Problema

El sistema requiere que el `Total Amount` se actualice automáticamente en tiempo real al añadir, eliminar o modificar precios de daños.

### 4.2 Solución

Utilizamos **Angular Signals** (basado en el patrón Observer).

- **Computed Signals:** Definimos el `totalAmount` como un `computed(() => ...)` que observa un `Signal<Damage[]>`.
- **Efecto:** No hay necesidad de llamar manualmente a una función de cálculo después de cada operación; la UI reacciona de forma atómica y eficiente a la mutación del estado.

---

## 5. Dependency Injection (Creational)

### 5.1 Implementación

- **Backend:** Uso de un contenedor de IoC (Inversion of Control) como `InversifyJS` o el sistema nativo de `NestJS`.
- **Frontend:** Uso de los `Providers` de Angular para servicios de API y gestión de estado.
- **Justificación:** Cumple con el requerimiento mandatorio de desacoplamiento y facilita enormemente la inyectabilidad de mocks en los tests de integración.

---

## 6. Summary Table

| Patrón         | Capa                | Requerimiento que resuelve                              |
| :------------- | :------------------ | :------------------------------------------------------ |
| **State**      | Domain (BE)         | Restricciones de estado y validación de 100 caracteres. |
| **Repository** | Infrastructure (BE) | Desacoplamiento de MongoDB y soporte para DI.           |
| **Signals**    | Presentation (FE)   | Reactividad en tiempo real de totales y formularios.    |
| **DI**         | Cross-cutting       | Testabilidad (>95% coverage) y modularidad.             |
