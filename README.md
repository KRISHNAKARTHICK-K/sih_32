# AGRIPROCURE

> **Enterprise Agricultural Procurement & Queue Management ERP**

AGRIPROCURE is a robust full-stack ERP system built for modern agricultural procurement operations, government procurement centres, millers, and farmers. It streamlines slot booking, token queue allocation, weighbridge intake, quality verification, electronic receipts, and direct bank transfers (DBT).

---

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Tooling:** Vite 8+
- **Styling:** Tailwind CSS (Custom enterprise theme with slate surfaces & agricultural green accents)
- **Routing:** React Router v6
- **State & Data Fetching:** TanStack React Query v5
- **HTTP Client:** Centralized Axios instance with auth interceptor architecture
- **Forms & Validation:** React Hook Form & Zod
- **Icons:** Lucide React

### Backend
- **Language & Runtime:** Java 17+ (Java 25 verified)
- **Framework:** Spring Boot 3.3.5
- **Modules:**
  - Spring Web (REST API)
  - Spring Data JPA (Hibernate ORM)
  - Spring Security (Stateless REST security & RBAC readiness)
  - Jakarta Validation (Bean Validation)
  - Spring WebSocket (STOMP Broker)
- **Database Driver:** PostgreSQL JDBC Driver
- **Build System:** Apache Maven 3.9+ (with Maven Wrapper included)

---

## Project Structure

```text
agri_proto/
├── frontend/                     # React + TypeScript + Vite Client
│   ├── src/
│   │   ├── api/                  # Centralized Axios client & API queries
│   │   │   ├── client.ts
│   │   │   └── health.ts
│   │   ├── components/
│   │   │   ├── ui/               # Reusable atomic ERP components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   └── common/           # Presentation state components
│   │   │       ├── LoadingState.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── ErrorState.tsx
│   │   ├── features/             # Feature-based business modules (Step 2+)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # ERP Layout Shell (Sidebar + Topbar)
│   │   │   └── AppLayout.tsx
│   │   ├── pages/                # Application pages
│   │   │   ├── DashboardPage.tsx # Live system health & status overview
│   │   │   └── NotFoundPage.tsx  # 404 handler
│   │   ├── routes/               # React Router route registry
│   │   │   └── index.tsx
│   │   ├── types/                # TypeScript interfaces and DTOs
│   │   ├── utils/                # Utility helpers (e.g., clsx / tailwind-merge)
│   │   ├── constants/            # Navigation items and app constants
│   │   ├── App.tsx               # App root with QueryClient & Router providers
│   │   ├── main.tsx              # DOM entrypoint
│   │   └── index.css             # Tailwind layers & typography
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                      # Spring Boot 3 Java Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/agriprocure/
│   │   │   │   ├── AgriprocureApplication.java
│   │   │   │   ├── config/       # CORS, WebSocket, and Bean configs
│   │   │   │   ├── controller/   # REST Controllers (HealthController)
│   │   │   │   ├── dto/          # Data Transfer Objects (ApiError, HealthResponse)
│   │   │   │   ├── entity/       # JPA Entities (Step 2)
│   │   │   │   ├── exception/    # GlobalExceptionHandler & custom exceptions
│   │   │   │   ├── repository/   # Spring Data JPA Repositories (Step 2)
│   │   │   │   ├── security/     # SecurityFilterChain & PasswordEncoder
│   │   │   │   ├── service/      # Business Service Layer
│   │   │   │   └── websocket/    # STOMP broker controllers
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/                 # Integration & Unit Tests
│   ├── .env.example
│   ├── pom.xml
│   └── README.md
│
└── README.md
```

---

## Environment Variables

### Frontend (`frontend/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Base URL for Spring Boot backend API |

### Backend (`backend/.env` / System Environment)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Spring Boot HTTP port |
| `DB_URL` | `jdbc:postgresql://localhost:5432/agriprocure` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `JPA_DDL_AUTO` | `update` | Hibernate DDL schema mode (`update`, `validate`, `none`) |
| `SHOW_SQL` | `false` | Log SQL queries to console |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Whitelisted origins for CORS |
| `JWT_SECRET` | *(Generated 256-bit key)* | Secret key for JWT signing (Step 3) |
| `JWT_EXPIRATION_MS` | `86400000` | JWT token validity in milliseconds |

---

## PostgreSQL Setup Instructions

1. **Install PostgreSQL** (v14 or newer) if not already installed.
2. **Start the PostgreSQL Service**:
   ```bash
   # On Windows (Services or Command line)
   net start postgresql-x64-16
   ```
3. **Create the Database**:
   ```sql
   CREATE DATABASE agriprocure;
   ```
4. **Configure Credentials**:
   Update `backend/.env` or export environment variables:
   ```bash
   export DB_URL=jdbc:postgresql://localhost:5432/agriprocure
   export DB_USERNAME=postgres
   export DB_PASSWORD=your_password
   ```

---

## How to Run

### 1. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend application will start at `http://localhost:5173`.

To build for production:
```bash
npm run build
```

### 2. Running the Backend
```bash
cd backend
mvn spring-boot:run
# Or with Maven Wrapper on Windows:
.\mvnw.cmd spring-boot:run
```
The backend API will start on port `8080`.

To build the executable JAR:
```bash
mvn clean package -DskipTests
```

---

## Health Check Verification

Test the backend health check endpoint:
```bash
curl http://localhost:8080/api/health
```

Expected JSON Response:
```json
{
  "status": "UP",
  "service": "AGRIPROCURE"
}
```

---

## Development Roadmap

- [x] **Step 1: Project Foundation** (Current)
  - Full-stack project setup (React + Vite + Tailwind + Spring Boot 3 + Maven)
  - Centralized Axios client & API error handling
  - ERP layout shell & reusable atomic design components
  - Health check endpoint `/api/health` with live status probe
- [ ] **Step 2: Database Schema & JPA Entities**
  - PostgreSQL schema for Farmers, Centres, Slots, Bookings, Quality, and Payments
  - JPA Entities, Repositories, and Flyway/Liquibase migrations
- [ ] **Step 3: Authentication & Role-Based Access Control (RBAC)**
  - JWT Authentication, Refresh tokens, User roles (`FARMER`, `OPERATOR`, `MANAGER`, `ADMIN`)
  - Route guards and protected API endpoints
- [ ] **Step 4: Farmer Registry & KYC Management**
- [ ] **Step 5: Slot Booking & Token Queue Management**
- [ ] **Step 6: Procurement Desk, Weighbridge & Quality Intake**
- [ ] **Step 7: Payment Disbursement & Settlement Ledger**
- [ ] **Step 8: Real-Time WebSocket Notifications & Live Queue Boards**
- [ ] **Step 9: Analytics, Reports & Audit Logs**
