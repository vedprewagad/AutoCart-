# AutoCart — Microservices Automobile Marketplace & Dealership Platform

AutoCart is a microservices-based automotive e-commerce platform built with Spring Cloud, Spring Boot, MySQL, and React (Vite). It provides role-based workflows for Customers, Showroom Dealers, and Platform Administrators.

---

## 1. Prerequisites

Before running the platform, ensure you have the following installed:
- **Java JDK**: Version 17 or 21
- **Apache Maven**: Version 3.8+
- **Node.js**: Version 18+ (with npm)
- **MySQL Server**: Version 8.0+

---

## 2. Database Setup

1. Start your local MySQL service.
2. Create the platform database and load the schema and catalogue data:

```bash
# Log into MySQL CLI or run these commands:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS autocart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

# Load schema (17 core tables)
mysql -u root -p autocart_db < database/schema.sql

# Load catalogue data (brands, models, variants, images, colours, banking & offers)
mysql -u root -p autocart_db < database/catalogue_data.sql
```

> **Note on Initial Accounts:** Initial user accounts are not in the catalogue dump. When `auth-service` starts for the first time, its database initializers (`AdminInitializer`, `DealerInitializer`, and `CustomerInitializer`) automatically create the seeded demo accounts in `autocart_db`.

---

## 3. Environment Variables

Spring Boot does not auto-load `.env` files by default. Set the required variables in your terminal shell or your IDE run configuration:

### Windows (PowerShell):
```powershell
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "your_mysql_password"
$env:JWT_SECRET = "your_strong_jwt_secret_at_least_32_characters_long"

# Optional integrations:
$env:ANTHROPIC_API_KEY = "your_anthropic_api_key"        # Required for AI Chatbot
$env:MAIL_USERNAME = "your_gmail@gmail.com"              # Required for Password Reset Emails
$env:MAIL_PASSWORD = "your_gmail_app_password"          # Required for Password Reset Emails
```

### Linux / macOS (Bash):
```bash
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_mysql_password"
export JWT_SECRET="your_strong_jwt_secret_at_least_32_characters_long"

# Optional integrations:
export ANTHROPIC_API_KEY="your_anthropic_api_key"        # Required for AI Chatbot
export MAIL_USERNAME="your_gmail@gmail.com"              # Required for Password Reset Emails
export MAIL_PASSWORD="your_gmail_app_password"          # Required for Password Reset Emails
```

*(See [.env.example](.env.example) for the full list of configuration properties).*

---

## 4. Microservices Startup Order & Ports

Start each service in a separate terminal window in the specified order. Wait for each service to initialize before starting the next:

| Order | Service | Directory | Port | Readiness Check |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Discovery Service** | `backend/discovery-service` | `8761` | Open `http://localhost:8761` in browser |
| **2** | **Auth Service** | `backend/auth-service` | `8081` | Registers as `AUTH-SERVICE` in Eureka; seeds demo accounts |
| **3** | **Business Service** | `backend/business-service` | `8082` | Registers as `BUSINESS-SERVICE` in Eureka |
| **4** | **Transaction Service** | `backend/transaction-service` | `8083` | Registers as `TRANSACTION-SERVICE` in Eureka |
| **5** | **AI Service** | `backend/ai-service` | `8084` | Registers as `AI-SERVICE` in Eureka |
| **6** | **API Gateway** | `backend/api-gateway` | `8080` | Listens at `http://localhost:8080` |
| **7** | **Frontend (Vite UI)**| `frontend/autocart-frontend` | `5173` | Run `npm run dev`; open `http://localhost:5173` |

Command for each backend service:
```bash
mvn spring-boot:run
```

Command for frontend:
```bash
cd frontend/autocart-frontend
npm install
npm run dev
```

---

## 5. Seeded Logins (Demo Only)

The following pre-configured accounts are automatically seeded on first startup for demonstration and testing:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@autocart.com` | `admin123` | *(Demo only)* Showroom & inventory approvals, platform analytics |
| **Dealer** | `dealer@bubhandari.com` | `dealer123` | *(Demo only)* Inventory management, test drives, customer enquiries |
| **Customer** | `john.doe@example.com` | `buyer123` | *(Demo only)* Vehicle catalogue browsing, bookings, checkout, reviews |

---

## 6. First Run Walkthrough

To test the complete end-to-end flow on a clean install:

1. **Log in as Dealer:**
   - Go to `http://localhost:5173/login` and log in with `dealer@bubhandari.com` / `dealer123`.
   - Navigate to the Dealer Portal inventory section and add a vehicle variant listing to your showroom with unit count, pricing, and discount.
   - Status will be marked as `PENDING` approval.
2. **Approve as Admin:**
   - Log out and log in with `admin@autocart.com` / `admin123`.
   - Go to the Admin Dashboard inventory tab and click **Approve** on the newly submitted listing.
   - Status updates to `APPROVED` / `AVAILABLE`.
3. **Purchase as Customer:**
   - Log out and log in with `john.doe@example.com` / `buyer123`.
   - Browse the vehicle catalogue, view the approved dealer's offer, select financing/color, and complete the purchase enquiry.
   - The inventory stock automatically decrements, and the order appears in your customer dashboard.

---

## 7. Known Limitations

- **Shared Database:** Services currently share a single MySQL database (`autocart_db`) and use cross-service `JdbcTemplate` queries for customer/dealer name hydration and stock synchronization, rather than event-driven asynchronous messaging or strictly separated databases per microservice.
- **No Automated Test Suites:** Automated unit and integration test suites are not yet implemented; validation is performed via manual browser testing and script-based API workflows.
- **Simulated Payment:** Payment processing at checkout is simulated via mock gateway transaction IDs (`TXN-...`); external payment gateway webhooks (e.g. Razorpay, Stripe) are not integrated.
