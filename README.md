Generic single-database configuration.
# Order Management System

A focused **Full-Stack Order Management System** built with Python, FastAPI, PostgreSQL, and React.

The project focuses on three essential business operations: **Product Management, Inventory Management, and Order Management**. While it includes an interactive frontend, its primary focus is backend engineering, including database design, business logic, transaction management, and RESTful API development.

> **Project Scope:** This is not a complete enterprise management system. It is a focused implementation of three important operations supported by three core database tables. The frontend provides an interactive way to explore these operations, while developers can also interact directly with the backend API.

## Live Demo

Explore the application through its deployed frontend, or access the backend directly.

- **Frontend:** [Live Demo](order-management-system-coh.pages.dev)This link may not work properly on some mobile devices. For the best experience, please open it on a laptop or desktop computer.
- **Backend API:** [API Base URL](https://order-management-system-7e751419.enzonic.dev/docs)

## Key Features

**Product Management:** Create, view, update, and deactivate products while managing their prices and availability.

**Inventory Management:** Track stock quantities, validate available inventory, deduct stock when orders are confirmed, and restore it when confirmed orders are cancelled.

**Order Management:** Create orders containing multiple products, calculate totals automatically, preserve historical product prices, and manage order status transitions.

## Screenshots

The following screenshots demonstrate the main application interfaces.
### Product Management
### Order Management
### Order Details
### API Documentation
### API 
** on linkedin ** [linkedin](https://lnkd.in/p/ddUqNkNf)

## Technology Stack

The backend is built with **Python and FastAPI**, using **SQLAlchemy 2.0** for ORM operations and **PostgreSQL** as the relational database. **Psycopg 3** provides database connectivity, while **Alembic** manages schema migrations. **Pydantic** and **Pydantic Settings** handle data validation and application configuration.

The frontend uses **React and TypeScript** to provide an interactive interface connected to the backend through HTTP requests.

**Testing:** Pytest is used as the testing framework for organizing and executing automated tests. HTTPX is used to send HTTP requests and verify API responses during integration testing.Automated testing is implemented with **Pytest and HTTPX**.

## System Architecture

The backend follows a layered architecture using the Repository Pattern and Service Layer to separate API handling, business logic, and database operations.

This structure keeps responsibilities clear and makes the application easier to maintain, test, and extend.

## Database Design

The database uses PostgreSQL and is centered around three main tables: `products`, `orders`, and `order_items`.

The following diagram illustrates the database tables and their relationships.

![Database Schema](models/your-database-diagram.png)

The design maintains referential integrity through foreign keys and database constraints. Order items also preserve the product price at the time of purchase, ensuring that historical order values remain unchanged when product prices are updated.

## Core Business Workflow

The system implements business rules that coordinate product, order, and inventory operations while maintaining data consistency.

### 1. Order Creation

When a customer creates an order, the backend validates the submitted information before saving it.

The system checks that the order contains at least one item, all referenced products exist and are active, and every requested quantity is greater than zero.

Product prices are retrieved directly from the database rather than accepted from the client. The backend calculates the order total and stores the applicable product price in each order item as a historical price snapshot.

A newly created order receives the `PENDING` status. At this stage, product stock is not deducted.

### 2. Order Confirmation and Inventory Deduction

When a pending order is confirmed, the system performs the following operations:

1. Retrieves the order and validates its current status.
2. Locks the relevant product records using database row-level locking (`SELECT FOR UPDATE`).
3. Checks that sufficient stock is available for every order item.
4. Deducts the requested quantities from the corresponding products.
5. Updates the order status to `CONFIRMED`.

All related changes are performed within a database transaction. If any validation or database operation fails, the transaction is rolled back to prevent partial updates.

Row-level locking helps prevent concurrent confirmation requests from consuming the same available stock.

### 3. Order Cancellation and Stock Restoration

The cancellation process depends on the order's current status:

- **PENDING:** The order is cancelled without changing product stock because no inventory was deducted during creation.
- **CONFIRMED:** The order is cancelled and the quantities previously deducted are restored to the corresponding products.
- **CANCELLED:** Further status changes are not allowed.

The cancellation operation also uses transaction management to ensure that the order status and inventory changes remain consistent.

### 4. Order Status Transitions

The system enforces the following status transitions:

| Current Status | Allowed Transition |
|---|---|
| PENDING | CONFIRMED |
| PENDING | CANCELLED |
| CONFIRMED | CANCELLED |
| CANCELLED | No further transitions |

These rules prevent invalid order operations and ensure that inventory changes occur only during the appropriate order lifecycle stages.

## API Overview

The RESTful API is available under `/api/v1/`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/products/` | Create a product |
| GET | `/products/` | List products |
| GET | `/products/{product_id}` | Get product details |
| PATCH | `/products/{product_id}` | Update a product |
| PATCH | `/products/{product_id}/deactivate` | Deactivate a product |
| POST | `/orders/` | Create an order |
| GET | `/orders/` | List orders |
| GET | `/orders/{order_id}` | Get order details |
| POST | `/orders/{order_id}/confirm` | Confirm an order |
| POST | `/orders/{order_id}/cancel` | Cancel an order |

For request formats, response examples, status codes, and interactive testing, refer to the [API Documentation](https://order-management-system-7e751419.enzonic.dev/docs).

## Getting Started

### Prerequisites

You need Python, PostgreSQL, and Git to run the backend locally. Node.js and npm are also required if you want to run the frontend.

### Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd order_management
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux / macOS:

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

### Environment Configuration

Create a `.env` file from the provided example:

```bash
copy .env.example .env
```

On Linux or macOS, use `cp .env.example .env` instead.

Configure the database connection variables in `.env` before proceeding.

### Database Setup

Create a PostgreSQL database, then apply the migrations:

1. Open PostgreSQL using pgAdmin 4 or psql.
2. Create a new database with the same name configured in the project's `.env` file.
3. Make sure the database connection settings in `.env` match your PostgreSQL configuration.
4. Apply the database migrations:

```bash
alembic upgrade head
```

```bash
alembic upgrade head
```

### Run the Backend

```bash
uvicorn app.main:app --reload
```

The API will be available at:

`http://127.0.0.1:8000`

Interactive Swagger documentation:

`http://127.0.0.1:8000/docs`

### Run the Frontend

If the frontend source code is included in the repository, navigate to its directory in a separate terminal and install its dependencies:

```bash
cd frontend
npm install
npm run dev
```

## Testing

The project uses **Pytest** for automated testing and **HTTPX** for API integration requests, running against an isolated test database to protect development and production data.

* **Unit Tests (`tests/unit/`):** Verify service-layer business logic and input validation in isolation.
* **Integration Tests (`tests/integration/`):** Validate end-to-end API endpoints, HTTP responses, and database operations.
* **Shared Configuration (`tests/conftest.py`):** Centralizes test setup and reusable fixtures.

### Running Tests

```bash
# Run the full test suite
pytest

# Run by category
pytest tests/unit/
pytest tests/integration/

# Run individual test files
pytest tests/unit/test_product_service.py
pytest tests/unit/test_order_service.py
pytest tests/integration/test_products_api.py
pytest tests/integration/test_orders_api.py
```

Use a separate testing database configured through `TEST_DATABASE_URL`.

## Project Scope and Limitations

The current implementation focuses on product, inventory, and order workflows. Features such as authentication, authorization, payment processing, shipping, notifications, multiple warehouses, and multi-currency support are outside the current scope.

The project is designed as a practical demonstration of backend development and frontend-backend integration, rather than a complete enterprise platform.

## Demo Video

A practical walkthrough demonstrating the main application workflows and backend API.

**Project Demo Video:** Coming Soon
