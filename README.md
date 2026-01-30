# AI Development & Decision Log

## Project: Claims Management System

- **Architecture:** Hexagonal / DDD
- **Tech Stack:** NestJS, Angular, MongoDB

### Architectural Decision: Hexagonal / DDD

The Hexagonal Architecture (Ports & Adapters) combined with Domain-Driven Design was chosen to ensure **maximum scalability**. This approach provides:

- **Clear separation of concerns** between business logic and external dependencies
- **Domain isolation** that makes the core business rules independent and testable
- **Flexibility** to swap implementations (databases, frameworks) without affecting the domain
- **Ease of scaling** as new features can be added without modifying existing core logic

---

# Claims Management System 🚗🛡️

A robust, full-stack monorepo application designed for insurance companies to manage vehicle claims and damages efficiently. This project demonstrates a scalable architecture using NestJS, Angular, and MongoDB, fully containerized with Docker.

## 🚀 Getting Started

The fastest way to run the entire ecosystem (Database, API, and Frontend) is using Docker Compose.

### Prerequisites

- Docker & Docker Compose
- Node.js v20 (if running locally without Docker)
- pnpm (recommended package manager)

### Installation & Run

1. Clone the repository:

```bash
git clone <your-repo-url>
cd claims-management-system
```

2. Configure Environment Variables:

The project includes a `.env` template. Ensure your `.env` in the root has:

```
PORT=3000
API_PREFIX=api/v1
MONGODB_URI=mongodb://mongodb:27017/claims_db
```

3. Launch with Docker:

```bash
docker-compose up --build
```

4. Access the Application:
   - Frontend: http://localhost
   - API Documentation (Swagger): http://localhost:3000/api/api-docs
   - API Base URL: http://localhost:3000/api/v1

## 🛠 Tech Stack & Rationale

| Technology       | Purpose            | Rationale                                                                                                                         |
| ---------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| NestJS           | Backend Framework  | Provides a highly structured, modular architecture out of the box, facilitating Dependency Injection and testability.             |
| Angular (v18+)   | Frontend Framework | Utilizes Signals for reactive state management and a component-based architecture for a rich User Experience.                     |
| MongoDB          | Database           | A NoSQL approach allows for flexible schema definitions for claims and nested damage objects, speeding up development iterations. |
| Tailwind CSS     | Styling            | Enables rapid UI development with a utility-first approach, ensuring a responsive and modern design.                              |
| Docker / Nginx   | Deployment         | Multi-stage builds ensure small, secure images. Nginx acts as a Reverse Proxy to handle SPA routing and CORS.                     |
| Jest / Supertest | Testing            | A robust testing suite (Unit & E2E) ensures business logic integrity, specifically for financial calculations.                    |

## 🏗 Key Features

- **Claim Management**: Create, view, and update insurance claims.
- **Damage Tracking**: Add multiple damages to a single claim with automatic Total Amount recalculation.
- **Real-time UX**: Character counters for descriptions and status-based business rules.
- **Strong Typing**: 100% TypeScript coverage with zero `any` policy for enhanced maintainability.
- **API Documentation**: Interactive Swagger UI for easy endpoint testing.
- **Optimized Performance**: Database projections to prevent "Overfetching" in list views.

## 🧪 Quality Assurance

The project maintains high standards of data integrity through automated testing.

### Run Unit Tests

````bash
# Backend
pnpm --filter api test:cov


### Run E2E/Integration Tests

Validates the full flow, including database persistence and total amount synchronization.

```bash
pnpm --filter api test:e2e
````

## 📂 Project Structure

```
.
├── apps
│   ├── api          # NestJS application (Domain-Driven Design influences)
│   └── client       # Angular application (Signal-based state)
├── docker-compose.yml
├── Dockerfile       # Multi-stage build for both apps
├── nginx.conf       # Reverse proxy & SPA configuration
└── openapi.yaml     # Exported API Specification
```

## 🏛 Design & Architecture Documentation

Detailed technical specifications and design decisions are available in the `docs/design` folder:

- [01 - Domain Model](https://github.com/juanisabba/claims-management-system/blob/main/docs/design/01-domain-model.md): Core entities definition and Ubiquitous Language.
- [02 - Business Rules](https://github.com/juanisabba/claims-management-system/blob/main/docs/design/02-business-rules.md): Validations, status transitions, and price calculation logic.
- [03 - Architecture](https://github.com/juanisabba/claims-management-system/blob/main/docs/design/03-architecture.md): Deep dive into Hexagonal/Clean Architecture layers and monorepo structure.
- [04 - Design Patterns](https://github.com/juanisabba/claims-management-system/blob/main/docs/design/04-design-patterns.md): Implementation details of Mappers, Repositories, and DI.
- [05 - State Machine](https://github.com/juanisabba/claims-management-system/blob/main/docs/design/05-state-machine.md): Lifecycle flow of a Claim (Pending → In Review → Finished).
