Mini ERP + CRM Operations Portal

A full-stack Mini ERP + CRM Operations Portal designed for wholesale/distribution business to manage customers, products, inventory, sales challans, and role-based operations.

The application provides separate access for Admin, Sales, Warehouse, and Accounts users with server-side session authentication and role-based authorization.

## Live Application

- Frontend: https://rams-erp.vercel.app
- Backend API: https://mini-erp-crm-operations-portal-7jx.ro.onrender.com

## User Roles

| Role | Main Responsibilities |
| --- | --- |
| Admin | Full access to customers, products, inventory, and challans |
| Sales | Customer management, product viewing, and sales challan operations |
| Warehouse | Product/inventory operations and read-only customer/challan access |

Authorization is enforced on the backend, while the frontend provides role-aware UI controls.

## Test Credentials

These credentials are provided for evaluation and testing:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@example.com | Admin123! |
| Sales | sales@example.com | Sales123! |
| Warehouse | warehouse@example.com | Warehouse123! |
| Accounts | accounts@example.com | Accounts123! |

The selected role on the login screen must match the actual role assigned to the user.

## Features

### 1. Authentication & Authorization

- Role-based login
- Roles: Admin, Sales, Warehouse, Accounts
- Server-side authentication using `express-session`
- PostgreSQL-backed session storage using `connect-pg-simple`
- Secure `HttpOnly` session cookie
- Role-based backend authorization middleware
- Protected frontend routes
- Logout support
- Session persistence across page refreshes

### 2. Customer CRM

The Customer CRM module supports:

- Create customer
- Edit customer
- Delete customer
- Search customers
- Filter customers
- View customer details
- Customer status
- Customer type
- Follow-up date
- Follow-up notes
- Follow-up history

Customer types include:

- Retail
- Wholesale
- Distributor

Customer statuses include:

- Lead
- Active
- Inactive

### 3. Product & Inventory Management

The inventory module supports:

- Create products
- Edit products
- View products
- Product search/filtering
- SKU management
- Category
- Unit price
- Current stock
- Minimum stock level
- Warehouse location
- Stock IN operations
- Stock movement history
- Low-stock identification

Stock-affecting operations use PostgreSQL transactions and row locking to maintain inventory consistency.

### 4. Sales Challans

The Sales Challan module supports:

- Create draft challan
- View challans
- Confirm challan
- Cancel draft challan
- Customer selection
- Product selection
- Quantity management
- Automatic challan numbering
- Stock validation
- Automatic stock reduction after confirmation
- Stock OUT movement creation
- Transaction rollback on failure

Challan Lifecycle:

```
Create Draft
     |
     | Stock is NOT changed
     v
   Draft
     |
     +------------------+
     |                  |
   Confirm            Cancel
     |                  |
     v                  v
 Confirmed           Cancelled
     |
     +--> Stock validation
     +--> Stock reduction
     +--> OUT movement
```

### 5. Product Snapshot

When a challan is created, product information relevant to that transaction is stored as a snapshot.

For example:

- Product Name
- SKU
- Unit Price
- Quantity


This preserves historical challan information even if the product'scurrent price or other details change later.

Business Rules

Stock Validation

A product cannot have negative stock.

Example:

Available Stock: 5
Requested Quantity: 8

Result:
Insufficient Stock
Stock remains unchanged

Draft Challan

Creating a draft challan does not reduce inventory.

Confirmed Challan

Confirming a challan:

Checks available stock.

Locks the relevant product rows.

Reduces stock.

Creates stock OUT movement records.

Marks the challan as confirmed.

If any step fails, the transaction is rolled back.

Challan Cancellation

Only draft challans can be cancelled.

Confirmed challans cannot be cancelled through the current workflow.

Technology Stack

Frontend

React

Vite

Tailwind CSS

React Router

Axios

Backend

Node.js

Express.js

REST APIs

Express Session

bcrypt

connect-pg-simple

Database

PostgreSQL

Deployment

Vercel --- Frontend

Render --- Backend

PostgreSQL --- Database / session persistence

Architecture

                         USER
                           |
                           v
                +----------------------+
                | React + Vite         |
                | Tailwind CSS         |
                | React Router         |
                +----------+-----------+
                           |
                         Axios
                   withCredentials
                           |
                           v
                +----------------------+
                | Node.js + Express    |
                | REST API             |
                +----------+-----------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
   Authentication    Business Logic    Authorization
          |                |                |
          +----------------+----------------+
                           |
                           v
                +----------------------+
                | PostgreSQL           |
                |                      |
                | Users                |
                | Customers             |
                | Products              |
                | Stock Movements       |
                | Challans              |
                | Challan Items         |
                | Sessions              |
                +----------------------+

Authentication Flow

User selects role
       |
       v
Email + Password + Role
       |
       v
POST /api/auth/login
       |
       v
Backend validates credentials
       |
       v
Backend validates selected role
       |
       v
Create server-side session
       |
       v
Secure HttpOnly session cookie
       |
       v
Protected API requests

The session stores only basic user information:

id
name
email
role

Passwords are never stored in the session.

Project Structure

Mini-ERP-CRM-Operations-Portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md

REST API Documentation

Authentication

Login

POST /api/auth/login

Example request:

{
  "email": "admin@example.com",
  "password": "Admin123!",
  "role": "Admin"
}

Current User

GET /api/auth/me

Logout

POST /api/auth/logout

Customers

GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

POST   /api/customers/:id/followups
GET    /api/customers/:id/followups

Supported customer listing parameters include pagination, search,status, and customer type.

Example:

GET /api/customers?page=1&limit=10&search=rahul

Products

GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id

POST   /api/products/:id/stock
GET    /api/products/:id/stock-movements

Example:

POST /api/products/1/stock

Stock operations create inventory movement records.

Challans

GET  /api/challans
POST /api/challans
GET  /api/challans/:id

POST /api/challans/:id/confirm
POST /api/challans/:id/cancel

A confirmed challan performs stock validation and inventory reductioninside a database transaction.

Local Development Setup

Prerequisites

Install:

Node.js

npm

PostgreSQL

Backend Setup

Navigate to the backend directory:

cd backend
npm install

Create an environment file:

.env

Use .env.example as the reference.

Example:

PORT=5000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

Start the backend:

npm start

For development:

npm run dev

The backend will run on:

http://localhost:5000

Frontend Setup

Navigate to the frontend directory:

cd frontend
npm install

Create:

.env

Example:

VITE_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

The Vite development server will provide the frontend URL in theterminal, normally:

http://localhost:5173

Production Environment

For production deployment, configure the backend with:

NODE_ENV=production
FRONTEND_URL=https://rams-erp.vercel.app
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_production_session_secret

The frontend should point to the deployed backend API using:

VITE_API_URL=https://mini-erp-crm-operations-portal-7jx.ro.onrender.com/api

Never commit .env files or production secrets to GitHub.

Deployment

Frontend

The frontend is deployed using Vercel.

Production URL:

https://rams-erp.vercel.app

Backend

The backend is deployed using Render.

Production API:

https://mini-erp-crm-operations-portal-7jx.ro.onrender.com

The production session configuration supports secure cross-originbrowser authentication between the deployed frontend and backend.

API Testing

The backend APIs can be tested using Postman.

Recommended testing order:

1. Login
2. Verify current session
3. Customers
4. Products
5. Stock operations
6. Challans
7. Confirm/cancel challans
8. Logout

For protected endpoints, the authenticated session cookie must beretained by the client.

Validation & Testing

The backend integration test suite has been validated with:

Authentication for all four roles

Customer CRUD and follow-ups

Product CRUD

Stock IN

Stock movement history

Challan draft creation

Challan confirmation

Challan cancellation

Insufficient-stock handling

Transaction rollback

Product snapshot behavior

Search, filtering, and pagination

HTTP error handling

Database integrity constraints

Frontend production validation includes:

Login

Role-based navigation

Dashboard

Customer workflows

Product workflows

Challan workflows

Protected routes

Session persistence

Logout

Known Limitations

The current implementation focuses on the core ERP/CRM workflowsrequired for the assignment.

Potential future enhancements include:

Advanced reporting and analytics

PDF generation/printing for challans

Email notifications

Detailed administrator audit-log UI

More advanced inventory reporting

Automated production monitoring

These features are outside the current core implementation scope.

Future Improvements

Possible future improvements include:

Dashboard charts and advanced analytics

PDF challan generation

Email-based customer follow-up reminders

Audit logging interface

Advanced inventory forecasting

More granular permissions

Automated CI/CD testing

Automated API documentation using OpenAPI/Swagger

Security Considerations

Passwords are hashed using bcrypt.

Sessions are stored server-side.

Session data is persisted in PostgreSQL.

Session cookies are HttpOnly.

Production cookies use Secure transport.

Credentialed CORS is restricted to the configured frontend origin.

Backend middleware enforces role-based authorization.

SQL queries use parameterized values.

Inventory-changing operations use database transactions.

Product rows are locked during critical stock operations.

Environment secrets are kept outside source control.

License

This project was developed as part of an academic/technical assignmentand is intended for evaluation and demonstration purposes.