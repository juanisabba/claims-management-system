# 05 – State Machine & Lifecycle

## 1. Propósito

Este documento define el comportamiento dinámico del `Claim`. La máquina de estados actúa como la "fuente de verdad" para las restricciones de mutabilidad de los daños y las condiciones de cierre del expediente, garantizando que las reglas de negocio se apliquen de forma consistente.

---

## 2. Diagrama de Transiciones (Mermaid)

Este diagrama detalla los estados permitidos y las condiciones necesarias (guards) para disparar cada transición.

```mermaid
stateDiagram-v2
    [*] --> Pending : Create Claim

    state Pending {
        direction lr
        [*] --> Mutable : Allows CRUD on Damages
    }

    state Finished {
        [*] --> Immutable : Read-only Record
    }

    Pending --> InReview : Submit for Review

    InReview --> Pending : Request Changes / Fixes
    InReview --> Finished : Approve & Close
    note right of InReview
        Guard: If any Damage is "High Severity"
        THEN description.length > 100
    end note

    Finished --> [*]
```
