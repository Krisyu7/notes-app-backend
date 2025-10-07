# Notes App - Frontend API Documentation

## Overview

This document provides comprehensive information about the backend API for the Smart Notes application. The backend is built with Spring Boot and provides REST endpoints for user authentication and note management.

**Base URL**: `http://localhost:8080` (development)

## Authentication

The API currently uses a simple User-Id header for authentication (JWT implementation is planned for future releases).

### Headers Required for Protected Endpoints
```
User-Id: <user_id>
```

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### 1. User Registration
- **POST** `/api/auth/register`
- **Description**: Register a new user account
- **Request Body**:
```json
{
  "username": "string (3-50 chars, required)",
  "email": "string (valid email, required)", 
  "password": "string (min 6 chars, required)"
}
```
- **Response** (201 Created):
```json
{
  "token": "string (currently user ID, will be JWT)",
  "username": "string",
  "email": "string", 
  "displayName": "string"
}
```
- **Error Responses**: 400 (validation), 409 (user exists)

#### 2. User Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user and get token
- **Request Body**:
```json
{
  "usernameOrEmail": "string (username or email, required)",
  "password": "string (required)"
}
```
- **Response** (200 OK):
```json
{
  "token": "string (currently user ID, will be JWT)",
  "username": "string",
  "email": "string",
  "displayName": "string" 
}
```
- **Error Responses**: 401 (unauthorized), 400 (validation)

#### 3. Get User Profile
- **GET** `/api/auth/profile`
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK):
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "avatarUrl": "string",
  "createdAt": "datetime",
  "lastLoginAt": "datetime"
}
```
- **Error Responses**: 404 (user not found)

#### 4. Update User Profile  
- **PUT** `/api/auth/profile`
- **Headers**: `User-Id: <user_id>`
- **Request Body**:
```json
{
  "displayName": "string",
  "avatarUrl": "string"
}
```
- **Response** (200 OK): UserProfile object
- **Error Responses**: 404 (user not found)

#### 5. Change Password
- **PUT** `/api/auth/password`  
- **Headers**: `User-Id: <user_id>`
- **Request Body**:
```json
{
  "oldPassword": "string (required)",
  "newPassword": "string (required)"
}
```
- **Response** (200 OK): Empty
- **Error Responses**: 400 (invalid password)

#### 6. Check Username Availability
- **GET** `/api/auth/check-username/{username}`
- **Response** (200 OK):
```json
{
  "available": "boolean"
}
```

#### 7. Check Email Availability  
- **GET** `/api/auth/check-email/{email}`
- **Response** (200 OK):
```json
{
  "available": "boolean"
}
```

#### 8. Logout
- **POST** `/api/auth/logout`
- **Description**: Client-side token cleanup (no server-side action currently)
- **Response** (200 OK): Empty

#### 9. Test Endpoint
- **GET** `/api/auth/test`
- **Response** (200 OK): "Auth API is working! Current time: ..."

---

### Notes Endpoints (`/api/notes`)

All notes endpoints require `User-Id` header unless specified otherwise.

#### 1. Get User Notes (Paginated)
- **GET** `/api/notes`
- **Headers**: `User-Id: <user_id>`
- **Query Parameters**:
  - `page` (default: 0) - Page number
  - `size` (default: 10, max: 100) - Page size
  - `sortBy` (default: "updatedAt") - Sort field
  - `sortDir` (default: "desc") - Sort direction (asc/desc)
- **Response** (200 OK): Paginated Note objects

#### 2. Get Note by ID
- **GET** `/api/notes/{id}`
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK): Note object
- **Error Responses**: 404 (note not found)

#### 3. Search Notes
- **GET** `/api/notes/search`
- **Headers**: `User-Id: <user_id>`
- **Query Parameters**:
  - `keyword` (optional) - Search in title/content
  - `subject` (optional) - Filter by subject
  - `category` (optional) - Filter by category  
  - `isFavorite` (optional) - Filter favorites
  - `page` (default: 0) - Page number
  - `size` (default: 10, max: 100) - Page size
- **Response** (200 OK): Paginated Note objects

#### 4. Create Note
- **POST** `/api/notes`
- **Headers**: `User-Id: <user_id>`
- **Request Body**:
```json
{
  "subject": "string (max 100 chars, required)",
  "title": "string (max 200 chars, required)", 
  "content": "string (max 10000 chars, required)",
  "tags": ["string array (optional)"],
  "category": "string (max 50 chars, optional)",
  "isFavorite": "boolean (optional, default: false)",
  "isPublic": "boolean (optional, default: false)"
}
```
- **Response** (201 Created): Note object
- **Error Responses**: 400 (validation)

#### 5. Update Note
- **PUT** `/api/notes/{id}`
- **Headers**: `User-Id: <user_id>`  
- **Request Body**: Same as Create Note
- **Response** (200 OK): Updated Note object
- **Error Responses**: 404 (not found), 400 (validation)

#### 6. Delete Note
- **DELETE** `/api/notes/{id}`
- **Headers**: `User-Id: <user_id>`
- **Response** (204 No Content): Empty
- **Error Responses**: 404 (not found)

#### 7. Batch Delete Notes
- **DELETE** `/api/notes/batch` 
- **Headers**: `User-Id: <user_id>`
- **Request Body**: `[1, 2, 3]` (array of note IDs)
- **Response** (204 No Content): Empty

#### 8. Get User Subjects
- **GET** `/api/notes/subjects`
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK): `["subject1", "subject2", ...]`

#### 9. Get User Tags  
- **GET** `/api/notes/tags`
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK): `["tag1", "tag2", ...]`

#### 10. Get User Categories
- **GET** `/api/notes/categories`
- **Headers**: `User-Id: <user_id>` 
- **Response** (200 OK): `["category1", "category2", ...]`

#### 11. Get Notes by Subject
- **GET** `/api/notes/subject/{subject}`
- **Headers**: `User-Id: <user_id>`
- **Query Parameters**: `page`, `size`
- **Response** (200 OK): Paginated Note objects

#### 12. Get Notes by Category
- **GET** `/api/notes/category/{category}`
- **Headers**: `User-Id: <user_id>`
- **Query Parameters**: `page`, `size`
- **Response** (200 OK): Paginated Note objects

#### 13. Get Notes by Tag
- **GET** `/api/notes/tag/{tag}`
- **Headers**: `User-Id: <user_id>`
- **Query Parameters**: `page`, `size` 
- **Response** (200 OK): Paginated Note objects

#### 14. Toggle Favorite Status
- **PUT** `/api/notes/{id}/favorite`
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK): Updated Note object

#### 15. Toggle Public Status  
- **PUT** `/api/notes/{id}/public`
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK): Updated Note object

#### 16. Get Favorite Notes
- **GET** `/api/notes/favorites`
- **Headers**: `User-Id: <user_id>`
- **Query Parameters**: `page`, `size`
- **Response** (200 OK): Paginated Note objects

#### 17. Get Note Statistics
- **GET** `/api/notes/stats`  
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK): NoteStats object

#### 18. Get Recently Updated Notes
- **GET** `/api/notes/recent/updated`
- **Headers**: `User-Id: <user_id>`
- **Response** (200 OK): Array of Note objects

#### 19. Get Recently Created Notes
- **GET** `/api/notes/recent/created`
- **Headers**: `User-Id: <user_id>` 
- **Response** (200 OK): Array of Note objects

#### 20. Get Public Notes (No Auth Required)
- **GET** `/api/notes/public`
- **Query Parameters**: `page`, `size`
- **Response** (200 OK): Paginated Note objects

#### 21. Get My Public Notes
- **GET** `/api/notes/public/mine`
- **Headers**: `User-Id: <user_id>`
- **Query Parameters**: `page`, `size`
- **Response** (200 OK): Paginated Note objects

#### 22. Test Endpoint
- **GET** `/api/notes/test`
- **Response** (200 OK): "Notes API is working! Current time: ..."

---

## Data Models

### Note Object
```json
{
  "id": "number",
  "subject": "string",
  "title": "string", 
  "content": "string",
  "tags": ["string array"],
  "category": "string",
  "isFavorite": "boolean",
  "isPublic": "boolean", 
  "createdAt": "datetime (ISO 8601)",
  "updatedAt": "datetime (ISO 8601)"
}
```

### User Object  
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "displayName": "string",
  "avatarUrl": "string", 
  "isActive": "boolean",
  "createdAt": "datetime (ISO 8601)",
  "updatedAt": "datetime (ISO 8601)",
  "lastLoginAt": "datetime (ISO 8601)"
}
```

### Paginated Response
```json
{
  "content": ["array of objects"],
  "pageable": {
    "sort": {
      "sorted": "boolean",
      "unsorted": "boolean"
    },
    "pageNumber": "number",
    "pageSize": "number"
  },
  "totalElements": "number", 
  "totalPages": "number",
  "last": "boolean",
  "first": "boolean",
  "numberOfElements": "number"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "string (error type)",
  "message": "string (error message)", 
  "timestamp": "datetime (ISO 8601)",
  "details": "object (optional, for validation errors)"
}
```

### Common Error Types
- **Validation Error** (400): Input validation failed
- **Not Found** (404): Resource not found  
- **Conflict** (409): Resource already exists
- **Unauthorized** (401): Authentication failed
- **Forbidden** (403): Access denied
- **Bad Request** (400): Invalid request
- **Internal Server Error** (500): Unexpected server error

### Validation Error Example
```json
{
  "error": "Validation Error",
  "message": "Input validation failed",
  "timestamp": "2024-01-01T12:00:00Z",
  "details": {
    "username": "Username must be between 3 and 50 characters",
    "email": "Email should be valid"
  }
}
```

---

## Development Notes

### CORS Configuration
- Allowed origins: `http://localhost:3000`, `http://localhost:8080`
- All authentication and notes endpoints support CORS

### Authentication Notes
- Current implementation uses User-Id header (temporary)
- JWT implementation is planned for future releases  
- No session management on server side currently

### Pagination
- Default page size: 10
- Maximum page size: 100
- Sorting supported on most list endpoints
- Default sort: `updatedAt` descending

### Validation Rules
- **Username**: 3-50 characters, unique
- **Email**: Valid email format, unique
- **Password**: Minimum 6 characters
- **Note Subject**: Max 100 characters, required
- **Note Title**: Max 200 characters, required
- **Note Content**: Max 10,000 characters, required
- **Category**: Max 50 characters, optional

### Future Enhancements
- JWT authentication implementation
- File upload support for notes  
- Real-time collaboration features
- Advanced search with full-text indexing
- Note sharing and permissions
- API rate limiting