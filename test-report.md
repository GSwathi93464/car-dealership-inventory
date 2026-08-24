# Test Report

## Car Dealership Inventory Management System

### 1. Testing Overview

The Car Dealership Inventory Management System was tested to verify authentication, authorization, car inventory operations, purchasing, restocking, search functionality, and API behavior.

The backend was tested using **Jest** and **Supertest**.

---

## 2. Testing Environment

| Component         | Technology                     |
| ----------------- | ------------------------------ |
| Frontend          | React + TypeScript + Vite      |
| Backend           | Node.js + Express + TypeScript |
| Database          | PostgreSQL                     |
| Testing Framework | Jest                           |
| API Testing       | Supertest                      |
| Authentication    | JWT                            |
| Password Security | bcrypt                         |

---

## 3. Functional Test Cases

### Authentication

| Test Case                          | Expected Result                        | Status |
| ---------------------------------- | -------------------------------------- | ------ |
| Register with valid details        | User should be registered successfully | PASS   |
| Register with existing email       | Registration should be rejected        | PASS   |
| Login with valid credentials       | JWT token should be returned           | PASS   |
| Login with invalid credentials     | Login should be rejected               | PASS   |
| Access protected API without token | Request should be rejected             | PASS   |

### Admin Operations

| Test Case             | Expected Result                    | Status |
| --------------------- | ---------------------------------- | ------ |
| Admin adds a car      | Car should be added to inventory   | PASS   |
| Admin updates car     | Car details should be updated      | PASS   |
| Admin deletes car     | Car should be removed              | PASS   |
| Admin restocks car    | Inventory quantity should increase | PASS   |
| Admin views inventory | Inventory should be displayed      | PASS   |

### User Operations

| Test Case                 | Expected Result                      | Status |
| ------------------------- | ------------------------------------ | ------ |
| User views available cars | Available cars should be displayed   | PASS   |
| User searches for a car   | Matching cars should be displayed    | PASS   |
| User filters inventory    | Filtered results should be displayed | PASS   |
| User purchases a car      | Quantity should decrease             | PASS   |
| Purchase unavailable car  | Purchase should be rejected          | PASS   |

---

## 4. Authorization Testing

Role-based access control was tested to ensure that administrative operations cannot be performed by normal users.

| Test Case                            | Expected Result  | Status |
| ------------------------------------ | ---------------- | ------ |
| Admin accesses admin operation       | Request allowed  | PASS   |
| Normal user accesses admin operation | Request rejected | PASS   |
| Request without authentication       | Request rejected | PASS   |

---

## 5. API Testing

The following REST API operations were tested:

### Authentication APIs

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/profile`

### Car APIs

* `GET /api/cars`
* `GET /api/cars/search`
* `POST /api/cars`
* `PUT /api/cars/:id`
* `DELETE /api/cars/:id`
* `POST /api/cars/:id/purchase`
* `POST /api/cars/:id/restock`

All implemented API operations were verified for successful requests and appropriate error handling.

---

## 6. Automated Testing

Backend tests were executed using:

```bash
cd backend
npm test -- --runInBand
```

### Result

**Status: PASS**

All implemented backend tests passed successfully.

---

## 7. Security Testing

The following security-related functionality was verified:

* Passwords are hashed using bcrypt.
* Authentication uses JWT tokens.
* Protected routes require authentication.
* Admin operations require the Admin role.
* Invalid authentication requests are rejected.
* Unauthorized users cannot perform administrative operations.

---

## 8. Error Handling Testing

The application was tested for common invalid scenarios:

* Invalid login credentials
* Duplicate user registration
* Missing authentication token
* Invalid car ID
* Unauthorized admin operations
* Purchase when inventory is unavailable
* Invalid request data

The application returns appropriate error responses for invalid operations.

---

## 9. UI Testing

The following frontend functionality was manually verified:

* Login page
* Registration page
* Admin dashboard
* Add car
* Edit car
* Delete car
* Restock inventory
* Search and filter
* Purchase car
* Logout

The UI functionality was verified through browser testing.

---

## 10. Screenshots

Application screenshots are available in the `screenshots` folder and are also displayed in the project `README.md`.

---

## 11. Final Test Summary

| Testing Area            | Result |
| ----------------------- | ------ |
| Authentication          | PASS   |
| Authorization           | PASS   |
| Admin Operations        | PASS   |
| User Operations         | PASS   |
| Car Inventory           | PASS   |
| Search and Filtering    | PASS   |
| Purchase                | PASS   |
| Restocking              | PASS   |
| API Testing             | PASS   |
| Security Testing        | PASS   |
| UI Testing              | PASS   |
| Automated Backend Tests | PASS   |

### Overall Result

**PASS**

The Car Dealership Inventory Management System successfully meets the implemented functional requirements. Authentication, role-based authorization, inventory management, purchasing, restocking, search/filtering, API operations, and backend testing were successfully verified.
