# AI Development & Decision Log

## Project: Claims Management System

### AI Collaboration Stack

To develop this system, an optimized workflow was implemented using a hybrid AI model approach:

- **Gemini & Claude**: Used for the discovery phase, brainstorming, and high-level architectural definition.
- **Cline (with Gemini 3 Pro)**: Main orchestrator for writing complex code, structural refactorings, and critical business logic.
- **Gemini 3 Flash**: Utilized via Cline for high-frequency tasks such as unit test generation, documentation, and repetitive tasks to optimize token consumption.

---

## [2026-01-29] Log Entry: Initial Setup & Structural Correction

### Task: Project Scaffolding & Folder Structure

**Status:** Completed ✅

**Context:** Claude initially proposed a structure based on a premature microservices approach for a monorepo of this scale.

**Correction:**

- **Overengineering Correction**: Rejected the creation of multiple external shared library repositories. Instead, instructed the AI to simplify the structure using a standard monorepo with pnpm-workspaces, keeping domain and infrastructure within each app to accelerate initial development without losing scalability.

**Result:** A cleaner, more manageable structure that allows Cline to navigate files more efficiently.

---

## [2026-01-29] Log Entry: Architectural Refactoring & AI Oversight

### Task 1: Domain Layer Refinement (Damage & Claim Entities)

**Status:** Completed ✅

**Context:** Cline generated initial boilerplate for domain entities and the state pattern. Manual intervention was required to elevate the code to Senior-level architectural standards.

**Key Refactors:**

- **Decoupling Identity Generation**: Moved ID generation responsibility out of the Domain to keep it platform-agnostic.
- **State Pattern Robustness**: Fixed a flaw where the AI used direct array mutations; implemented internal aggregate methods to preserve encapsulation.
- **Rehydration Logic**: Added logic to the Claim constructor to ensure internal state matches persisted status when loading from the DB, preventing business rule bypasses.
- **Type Safety**: Resolved circular dependencies and ESLint errors (no-unsafe-call) via interface contracts.

### Task 2: Infrastructure-Agnostic Application Layer

**Status:** Completed ✅

**Conflict:** Cline proposed NestJS @Injectable() decorators and external uuid libraries inside the Application Layer.

**Resolution:** Rejected framework coupling to maintain a Pure Application Layer following Hexagonal Architecture principles.

**Key Changes:**

- **Purity**: Removed NestJS decorators from Use Cases, keeping them as pure TypeScript classes.
- **Dependency Reduction**: Replaced uuid with native Node.js crypto.randomUUID().
- **Validation**: Enforced the use of factory methods (Severity.create()) to ensure consistent validation.

### Task 3: Infrastructure Layer Strategy & Schema Standardization

**Status:** Completed ✅

**Decision:** Rejected NestJS/Mongoose decorators (@Schema, @Prop).

**Reasoning:** Prevented pollution of Domain Entities with infrastructure-specific decorators to stay consistent with the /docs/design patterns.

**Implementation:**

- **Persistence Control**: Used new Schema<ClaimDocument> for strict format control.
- **Standardization**: Standardized ClaimSchema and DamageSchema with support for application-generated UUIDs.

---

## [2026-01-30] Log Entry: Testing Strategy & Error Handling

### Task 4: Exception Filter & Edge Case Validation

**Status:** Completed ✅

**Conflict:** Gemini 3 Flash generated unit tests that passed but ignored empty error messages in the global exception filter.

**Correction:**

- **Test Refinement**: Detected a flaw where the filter returned an empty string on unexpected 500 errors. Forced the AI to implement a fallback message ("Internal server error") and updated tests to validate this consistency.

**Result:** 100% coverage in the infrastructure layer, including logical branches not initially foreseen by the AI.

---

## [2026-01-30] Log Entry: Docker & Nginx Orchestration

### Task 5: Containerization & SPA Routing

**Status:** Completed ✅

**Conflict:** The initial AI-generated Dockerfile lacked proper Nginx configuration for Angular, leading to 404 errors on page refresh.

**Correction:**

- **Reverse Proxy Implementation**: Instructed the AI to create a robust nginx.conf with try_files for SPA and a reverse proxy for the API under the /api/v1 prefix.
- **Environmental Sync**: Corrected docker-compose.yml to use the mongodb service name in the connection URI instead of localhost.
