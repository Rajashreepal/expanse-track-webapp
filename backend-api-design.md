# Backend API Design for ExpenseFlow Application

## Overview
This document outlines the complete REST API design for the ExpenseFlow expense management system based on the Angular frontend requirements.

## Base URL
```
https://api.expenseflow.com/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication & User Management

### 1.1 User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "fname": "string",
  "lname": "string",
  "email": "string",
  "password": "string",
  "role": "employee | manager",
  "department": "string"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "string",
    "fname": "string",
    "lname": "string",
    "email": "string",
    "role": "employee | manager",
    "department": "string",
    "createdAt": "ISO8601 timestamp"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Email is already registered"
}
```

---

### 1.2 User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "role": "employee | manager"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "string",
      "fname": "string",
      "lname": "string",
      "email": "string",
      "role": "employee | manager",
      "department": "string",
      "createdAt": "ISO8601 timestamp"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials or wrong role selected"
}
```

---

### 1.3 Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fname": "string",
    "lname": "string",
    "email": "string",
    "role": "employee | manager",
    "department": "string",
    "createdAt": "ISO8601 timestamp"
  }
}
```

---

### 1.4 Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Expense Management (Employee)

### 2.1 Submit New Expense
**POST** `/expenses`

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```json
{
  "title": "string (max 100 chars)",
  "category": "Travel | Food & Dining | Accommodation | Office Supplies | Software/Tools | Training | Client Entertainment | Other",
  "amount": "number (1-100000)",
  "date": "YYYY-MM-DD (not future date)",
  "description": "string (optional)",
  "receipt": "file (optional, max 5MB, .png/.jpg/.jpeg/.pdf)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense submitted successfully",
  "data": {
    "id": "string",
    "userId": "string",
    "userName": "string",
    "userDept": "string",
    "title": "string",
    "category": "string",
    "amount": "number",
    "date": "YYYY-MM-DD",
    "description": "string",
    "status": "Pending",
    "receiptName": "string | null",
    "receiptUrl": "string | null",
    "submittedAt": "ISO8601 timestamp",
    "reviewedAt": null,
    "reviewNote": ""
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "errors": [
    "Amount exceeds ₹1,00,000 limit",
    "Date cannot be in the future",
    "Receipt is required for Client Entertainment expenses",
    "File exceeds 5MB limit"
  ]
}
```

---

### 2.2 Get User's Expenses
**GET** `/expenses/my-expenses`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): `Pending | Approved | Rejected`
- `category` (optional): Category filter
- `search` (optional): Search by title or category
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "string",
        "userId": "string",
        "userName": "string",
        "userDept": "string",
        "title": "string",
        "category": "string",
        "amount": "number",
        "date": "YYYY-MM-DD",
        "description": "string",
        "status": "Pending | Approved | Rejected",
        "receiptName": "string | null",
        "receiptUrl": "string | null",
        "submittedAt": "ISO8601 timestamp",
        "reviewedAt": "ISO8601 timestamp | null",
        "reviewNote": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

---

### 2.3 Get Single Expense Details
**GET** `/expenses/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "userName": "string",
    "userDept": "string",
    "title": "string",
    "category": "string",
    "amount": "number",
    "date": "YYYY-MM-DD",
    "description": "string",
    "status": "Pending | Approved | Rejected",
    "receiptName": "string | null",
    "receiptUrl": "string | null",
    "submittedAt": "ISO8601 timestamp",
    "reviewedAt": "ISO8601 timestamp | null",
    "reviewNote": "string"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Expense not found"
}
```

---

### 2.4 Download Receipt
**GET** `/expenses/:id/receipt`

**Headers:** `Authorization: Bearer <token>`

**Response:** Binary file download with appropriate Content-Type header

---

## 3. Expense Analytics (Employee)

### 3.1 Get Employee Overview Stats
**GET** `/analytics/employee/overview`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "thisMonthCount": 5,
    "pendingCount": 2,
    "approvedCount": 3,
    "rejectedCount": 1,
    "totalApprovedAmount": 25000,
    "recentExpenses": [
      {
        "id": "string",
        "title": "string",
        "category": "string",
        "amount": "number",
        "date": "YYYY-MM-DD",
        "status": "string"
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Travel",
        "amount": 18500,
        "count": 3,
        "percent": 45,
        "color": "#38bdf8"
      }
    ]
  }
}
```

---

### 3.2 Get Employee Monthly Summary
**GET** `/analytics/employee/monthly-summary`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `months` (optional, default: 3): Number of recent months to return

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "monthlySummaries": [
      {
        "month": "February 2025",
        "year": 2025,
        "monthIndex": 1,
        "total": 35000,
        "approved": 25000,
        "pending": 5000,
        "rejected": 5000,
        "count": 8
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Travel",
        "amount": 18500,
        "count": 3,
        "percent": 45,
        "color": "#38bdf8"
      }
    ],
    "allTimeStats": {
      "totalSubmitted": 25,
      "totalAmount": 125000,
      "totalApproved": 95000,
      "approvalRate": 85,
      "avgExpense": 5000
    }
  }
}
```

---

## 4. Approval Management (Manager)

### 4.1 Get Pending Approvals
**GET** `/approvals/pending`

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Manager

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "string",
        "userId": "string",
        "userName": "string",
        "userDept": "string",
        "title": "string",
        "category": "string",
        "amount": "number",
        "date": "YYYY-MM-DD",
        "description": "string",
        "status": "Pending",
        "receiptName": "string | null",
        "receiptUrl": "string | null",
        "submittedAt": "ISO8601 timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### 4.2 Get All Expenses (Manager View)
**GET** `/approvals/all`

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Manager

**Query Parameters:**
- `status` (optional): `Pending | Approved | Rejected`
- `category` (optional): Category filter
- `search` (optional): Search by employee name, title, or category
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "string",
        "userId": "string",
        "userName": "string",
        "userDept": "string",
        "title": "string",
        "category": "string",
        "amount": "number",
        "date": "YYYY-MM-DD",
        "description": "string",
        "status": "Pending | Approved | Rejected",
        "receiptName": "string | null",
        "receiptUrl": "string | null",
        "submittedAt": "ISO8601 timestamp",
        "reviewedAt": "ISO8601 timestamp | null",
        "reviewNote": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

---

### 4.3 Review Expense (Approve/Reject)
**PATCH** `/approvals/:id/review`

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Manager

**Request Body:**
```json
{
  "status": "Approved | Rejected",
  "reviewNote": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense approved successfully",
  "data": {
    "id": "string",
    "status": "Approved | Rejected",
    "reviewNote": "string",
    "reviewedAt": "ISO8601 timestamp"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Only managers can review expenses"
}
```

---

## 5. Analytics & Reports (Manager)

### 5.1 Get Manager Overview Stats
**GET** `/analytics/manager/overview`

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Manager

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 150,
    "pendingCount": 12,
    "approvedThisMonth": 85000,
    "rejectionRate": 8,
    "pendingExpenses": [
      {
        "id": "string",
        "userName": "string",
        "title": "string",
        "category": "string",
        "amount": "number"
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Travel",
        "amount": 185000,
        "count": 25,
        "percent": 35,
        "color": "#38bdf8"
      }
    ]
  }
}
```

---

### 5.2 Get Team Monthly Reports
**GET** `/analytics/manager/monthly-reports`

**Headers:** `Authorization: Bearer <token>`

**Role Required:** Manager

**Query Parameters:**
- `months` (optional, default: 3): Number of recent months

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "monthlySummaries": [
      {
        "month": "February 2025",
        "year": 2025,
        "monthIndex": 1,
        "total": 250000,
        "approved": 220000,
        "pending": 15000,
        "rejected": 15000,
        "count": 45
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Travel",
        "amount": 185000,
        "count": 25,
        "percent": 35,
        "color": "#38bdf8"
      }
    ],
    "teamStats": {
      "totalSubmitted": 150,
      "totalValue": 850000,
      "totalApproved": 750000,
      "approvalRate": 88,
      "avgExpense": 5666,
      "pendingReview": 12
    }
  }
}
```

---

## 6. Reference Data

### 6.1 Get Expense Categories
**GET** `/reference/categories`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "Travel",
    "Food & Dining",
    "Accommodation",
    "Office Supplies",
    "Software/Tools",
    "Training",
    "Client Entertainment",
    "Other"
  ]
}
```

---

### 6.2 Get Departments
**GET** `/reference/departments`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "Engineering",
    "Marketing",
    "Sales",
    "Operations",
    "Finance",
    "HR",
    "Product"
  ]
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Error message",
  "errors": ["Array of validation errors (optional)"],
  "code": "ERROR_CODE (optional)"
}
```

### Common HTTP Status Codes:
- `200 OK` - Successful GET/PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Business Rules & Validations

### Expense Submission Rules:
1. Maximum single expense: ₹1,00,000
2. Minimum expense: ₹1
3. Expenses above ₹10,000 should be flagged for manager attention
4. Client Entertainment expenses require a receipt
5. Future-dated expenses are not accepted
6. Receipt file size limit: 5MB
7. Allowed receipt formats: PNG, JPG, JPEG, PDF

### Role-Based Access:
- **Employee**: Can submit expenses, view own expenses, view own analytics
- **Manager**: Can view all expenses, approve/reject expenses, view team analytics

### Status Workflow:
```
Pending → Approved (by Manager)
Pending → Rejected (by Manager)
```
Once reviewed, status cannot be changed back to Pending.

---

## Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- All other endpoints: 100 requests per minute per user

---

## Pagination
All list endpoints support pagination with these query parameters:
- `page` (default: 1)
- `limit` (default: 50, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## File Upload Specifications

### Receipt Upload:
- **Endpoint**: POST `/expenses` (multipart/form-data)
- **Field name**: `receipt`
- **Max size**: 5MB
- **Allowed types**: image/png, image/jpeg, application/pdf
- **Storage**: Cloud storage (S3/Azure Blob/GCS)
- **Access**: Authenticated users only, owner or manager

---

## Security Considerations

1. **Authentication**: JWT tokens with 24-hour expiration
2. **Password**: Minimum 6 characters, hashed with bcrypt
3. **File Upload**: Virus scanning, file type validation
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize all user inputs
6. **CORS**: Configure allowed origins
7. **HTTPS**: All endpoints must use HTTPS in production
8. **Rate Limiting**: Prevent abuse
9. **Input Validation**: Server-side validation for all inputs

---

## Database Schema Recommendations

### Users Table:
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  fname VARCHAR(100) NOT NULL,
  lname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('employee', 'manager') NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

### Expenses Table:
```sql
CREATE TABLE expenses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  receipt_name VARCHAR(255),
  receipt_url VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by VARCHAR(36),
  review_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_category (category)
);
```

---

## Technology Stack Recommendations

### Backend Framework Options:
- **Node.js**: Express.js, NestJS
- **Python**: FastAPI, Django REST Framework
- **Java**: Spring Boot
- **.NET**: ASP.NET Core

### Database:
- **Primary**: PostgreSQL or MySQL
- **Caching**: Redis

### File Storage:
- AWS S3, Azure Blob Storage, or Google Cloud Storage

### Authentication:
- JWT (JSON Web Tokens)
- Refresh token mechanism

---

## API Versioning
Current version: `v1`
Base path: `/api/v1`

Future versions will use `/api/v2`, etc.

---

## Monitoring & Logging
- Log all API requests with user ID, endpoint, timestamp
- Track expense submission and approval metrics
- Monitor file upload success/failure rates
- Alert on unusual patterns (high rejection rates, large expenses)
