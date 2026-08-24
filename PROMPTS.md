# Car Dealership Inventory Management System - Development Prompt

## Project Requirement

Build a full-stack Car Dealership Inventory Management System with a React + TypeScript frontend, Node.js + Express + TypeScript backend, and PostgreSQL database.

## Authentication

Implement secure user authentication with:

* User registration
* User login
* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes
* Role-based access control for Admin and User roles

## Admin Features

Admin users should be able to:

* Add new cars
* View all cars
* Edit car details
* Delete cars
* Restock car inventory
* View inventory quantity and status

## User Features

Normal users should be able to:

* Login and access the inventory
* View available cars
* Search cars
* Filter cars
* Purchase cars
* View available inventory quantity
* View car status

## Car Information

Each car should contain:

* ID
* Make
* Model
* Category
* Year
* Price
* Color
* Mileage
* Quantity
* Status

## Backend Requirements

Create RESTful APIs using Node.js, Express, and TypeScript.

Required endpoints include:

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/profile`

### Cars

* `GET /api/cars`
* `GET /api/cars/search`
* `POST /api/cars`
* `PUT /api/cars/:id`
* `DELETE /api/cars/:id`
* `POST /api/cars/:id/purchase`
* `POST /api/cars/:id/restock`

## Database

Use PostgreSQL for storing:

* Users
* Roles
* Cars
* Inventory information

Use proper relationships, constraints, and database queries.

## Frontend Requirements

Build the frontend using:

* React
* TypeScript
* Vite
* CSS

The UI should provide:

* Login page
* Registration page
* Admin dashboard
* User inventory dashboard
* Add car form
* Edit car functionality
* Delete functionality
* Restock functionality
* Search and filter functionality
* Purchase functionality
* Logout functionality

## Security

Implement:

* JWT authentication
* Password hashing with bcrypt
* Protected routes
* Admin-only operations
* Input validation
* Proper error handling

## Testing

Implement backend tests using:

* Jest
* Supertest

Test important authentication and car inventory operations.

## Documentation

Create a professional `README.md` containing:

* Project overview
* Features
* Technology stack
* API endpoints
* Project structure
* Installation instructions
* Running instructions
* Testing instructions
* Screenshots
* Project highlights

## Expected Result

The final application should be a complete, functional, and secure Car Dealership Inventory Management System with separate Admin and User capabilities, PostgreSQL database integration, REST APIs, authentication, inventory management, search/filtering, purchasing, restocking, and automated backend testing.
