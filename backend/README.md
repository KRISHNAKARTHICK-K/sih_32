# AGRIPROCURE Backend

Spring Boot 3 REST API and WebSocket backend for AGRIPROCURE Agricultural Procurement & Queue Management ERP.

## Technology Stack
- Java 17+
- Spring Boot 3.3.5
- Spring Web (REST API)
- Spring Data JPA (Hibernate)
- PostgreSQL Driver
- Spring Security (Stateless / REST)
- Bean Validation (Jakarta Validation)
- Spring WebSocket (STOMP Broker)
- Maven 3.9+

## Package Structure
```text
backend/src/main/java/com/agriprocure/
├── AgriprocureApplication.java
├── config/              # CORS, WebSocket, and Bean configurations
├── controller/          # REST API Controllers (e.g. HealthController)
├── dto/                 # Data Transfer Objects & standard response models
├── entity/              # JPA Database Entities
├── exception/           # Centralized exception handler & custom exceptions
├── repository/          # Spring Data JPA Repositories
├── security/            # Security filter chains and authentication configs
├── service/             # Business Logic Layer
└── websocket/           # WebSocket controllers and STOMP message handlers
```

## Setup & Running

### Prerequisites
- JDK 17 or higher
- Apache Maven 3.8+
- PostgreSQL 14+ (optional for initial health check, required for database operations)

### Environment Variables
Copy `.env.example` to `.env` or configure system environment variables:
```bash
cp .env.example .env
```

### Build
```bash
mvn clean package
```

### Run
```bash
mvn spring-boot:run
```

### Health Check Endpoint
```bash
curl http://localhost:8080/api/health
```
Response:
```json
{
  "status": "UP",
  "service": "AGRIPROCURE"
}
```
