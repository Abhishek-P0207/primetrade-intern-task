# API Documentation

## Overview
This is a RESTful API for user authentication and task management built with Next.js, Prisma, and PostgreSQL.

**Base URL:** `http://localhost:3000`

**Authentication:** JWT Bearer Token (for protected endpoints)

---

## Authentication Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"
}
```

**Required Fields:**
- `email` (string, email format)
- `password` (string, minimum 8 characters)

**Optional Fields:**
- `name` (string)
- `role` (string, enum: "USER" | "ADMIN", default: "USER")

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing required fields or password too short
- `409` - User already exists
- `500` - Internal server error

---

### 2. Login User
Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (string, email format)
- `password` (string)

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Invalid credentials
- `500` - Internal server error

---

### 3. Get Current User
Retrieve the authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-02-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - User not found
- `500` - Internal server error

---

## Task Management Endpoints

### 4. Get All Tasks
Retrieve all tasks for the authenticated user.

**Endpoint:** `GET /api/tasks`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "OPEN",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-02-04T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `500` - Internal server error

---

### 5. Create Task
Create a new task for the authenticated user.

**Endpoint:** `POST /api/tasks`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "OPEN"
}
```

**Required Fields:**
- `title` (string)

**Optional Fields:**
- `description` (string, nullable)
- `status` (string, enum: "OPEN" | "IN_PROGRESS" | "DONE", default: "OPEN")

**Success Response (201):**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "OPEN",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-02-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Invalid or missing token
- `500` - Internal server error

---

### 6. Get Task by ID
Retrieve a specific task by its ID.

**Endpoint:** `GET /api/tasks/{id}`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**URL Parameters:**
- `id` (string, UUID) - Task ID

**Success Response (200):**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "OPEN",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-02-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `403` - Forbidden (task belongs to another user)
- `404` - Task not found
- `500` - Internal server error

---

### 7. Update Task
Update a specific task by its ID.

**Endpoint:** `PATCH /api/tasks/{id}`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**URL Parameters:**
- `id` (string, UUID) - Task ID

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}
```

**Optional Fields (at least one required):**
- `title` (string)
- `description` (string, nullable)
- `status` (string, enum: "OPEN" | "IN_PROGRESS" | "DONE")

**Success Response (200):**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Updated task title",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-02-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `403` - Forbidden (task belongs to another user)
- `404` - Task not found
- `500` - Internal server error

---

### 8. Delete Task
Delete a specific task by its ID.

**Endpoint:** `DELETE /api/tasks/{id}`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**URL Parameters:**
- `id` (string, UUID) - Task ID

**Success Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `403` - Forbidden (task belongs to another user)
- `404` - Task not found
- `500` - Internal server error

---

## Data Models

### User
```typescript
{
  id: string (UUID)
  email: string
  name: string | null
  role: "USER" | "ADMIN"
  createdAt: Date
}
```

### Task
```typescript
{
  id: string (UUID)
  title: string
  description: string | null
  status: "OPEN" | "IN_PROGRESS" | "DONE"
  userId: string (UUID)
  createdAt: Date
}
```

---

## Authentication Flow

1. **Register or Login** to receive a JWT token
2. **Store the token** securely (localStorage or httpOnly cookie)
3. **Include the token** in the Authorization header for protected endpoints:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
4. **Token expires** after 7 days

---

## Example Usage with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get current user:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create a task:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "OPEN"
  }'
```

### Get all tasks:
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Update a task:
```bash
curl -X PATCH http://localhost:3000/api/tasks/{task-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### Delete a task:
```bash
curl -X DELETE http://localhost:3000/api/tasks/{task-id} \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Error Handling

All error responses follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Notes

- All IDs are UUIDs (v4)
- Timestamps are in ISO 8601 format
- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 7 days
- Tasks are automatically associated with the authenticated user
- Users can only access their own tasks
