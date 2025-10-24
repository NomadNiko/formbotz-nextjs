# API Reference

Complete reference for all FormBotz API endpoints.

## Base URL

**Development:**
```
http://localhost:3000/api
```

**Production:**
```
https://yourdomain.com/api
```

---

## Authentication

FormBotz uses NextAuth.js with JWT tokens for authentication.

### Session Management
- Sessions stored in httpOnly cookies
- CSRF protection enabled
- Tokens expire after 30 days

### Protected Routes
Most API routes require authentication. Include session cookie in requests.

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** None required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client"
  }
}
```

**Errors:**
- `400` - Missing or invalid fields
- `409` - Email already registered

---

### Login

**Endpoint:** `POST /api/auth/signin`

Handled by NextAuth.js. Use NextAuth client for authentication.

---

### Logout

**Endpoint:** `POST /api/auth/signout`

Handled by NextAuth.js.

---

### Get Session

**Endpoint:** `GET /api/auth/session`

Get current session information.

**Response (200 OK):**
```json
{
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client"
  },
  "expires": "2024-04-20T10:30:00.000Z"
}
```

---

## Forms API

### Get All Forms

Get all forms for the authenticated user.

**Endpoint:** `GET /api/forms`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `published`, `archived`)

**Response (200 OK):**
```json
{
  "forms": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Customer Survey",
      "description": "Monthly feedback",
      "publicUrl": "customer-survey",
      "status": "published",
      "stats": {
        "views": 1250,
        "starts": 892,
        "completions": 734,
        "completionRate": 82.3
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-03-20T14:22:00.000Z"
    }
  ]
}
```

**Errors:**
- `401` - Not authenticated

---

### Create Form

Create a new form.

**Endpoint:** `POST /api/forms`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Customer Survey",
  "description": "Monthly customer feedback",
  "publicUrl": "customer-survey-2024"
}
```

**Response (201 Created):**
```json
{
  "form": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "clientId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Customer Survey",
    "description": "Monthly customer feedback",
    "publicUrl": "customer-survey-2024",
    "status": "draft",
    "steps": [],
    "settings": {},
    "stats": {
      "views": 0,
      "starts": 0,
      "completions": 0,
      "completionRate": 0
    }
  }
}
```

**Errors:**
- `400` - Invalid request body
- `401` - Not authenticated
- `409` - Public URL already exists
- `403` - Forms limit exceeded

---

### Get Form by ID

Get a single form with all details.

**Endpoint:** `GET /api/forms/:formId`

**Authentication:** Required (must own form)

**Response (200 OK):**
```json
{
  "form": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Customer Survey",
    "publicUrl": "customer-survey",
    "status": "published",
    "steps": [
      {
        "id": "uuid-step-1",
        "order": 0,
        "type": "info",
        "display": {
          "messages": [{ "text": "Welcome!" }]
        }
      }
    ],
    "settings": {
      "brandColor": "#667eea",
      "typingDelay": "normal"
    },
    "stats": {
      "views": 1250,
      "starts": 892,
      "completions": 734
    }
  }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not form owner)
- `404` - Form not found

---

### Update Form

Update form details, steps, or settings.

**Endpoint:** `PUT /api/forms/:formId`

**Authentication:** Required (must own form)

**Request Body:**
```json
{
  "name": "Updated Survey Name",
  "status": "published",
  "steps": [
    {
      "id": "uuid-1",
      "order": 0,
      "type": "info",
      "display": {
        "messages": [{ "text": "Welcome!" }]
      },
      "input": { "type": "none" }
    }
  ],
  "settings": {
    "brandColor": "#667eea",
    "enableProgressBar": true
  }
}
```

**Response (200 OK):**
```json
{
  "form": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Updated Survey Name",
    "status": "published",
    ...
  }
}
```

**Errors:**
- `400` - Validation error
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Form not found

---

### Delete Form

Delete a form and all its submissions.

**Endpoint:** `DELETE /api/forms/:formId`

**Authentication:** Required (must own form)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Form deleted successfully"
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Form not found

---

### Get Form Submissions

Get all submissions for a specific form.

**Endpoint:** `GET /api/forms/:formId/submissions`

**Authentication:** Required (must own form)

**Query Parameters:**
- `status` (optional): Filter by status (`in-progress`, `completed`, `abandoned`)
- `limit` (optional): Limit results (default: 100)
- `skip` (optional): Skip results for pagination (default: 0)

**Response (200 OK):**
```json
{
  "form": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Customer Survey"
  },
  "submissions": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "sessionId": "session-uuid-abc123",
      "status": "completed",
      "data": {
        "user_name": "Jane Smith",
        "user_email": "jane@example.com",
        "satisfaction": 5
      },
      "metadata": {
        "startedAt": "2024-03-20T15:30:00.000Z",
        "completedAt": "2024-03-20T15:33:45.000Z"
      }
    }
  ],
  "total": 734,
  "page": 1,
  "limit": 100
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Form not found

---

## Submissions API

### Get All Submissions

Get all submissions across all forms for the authenticated user.

**Endpoint:** `GET /api/submissions`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Limit results (default: 100)
- `skip` (optional): Skip results for pagination

**Response (200 OK):**
```json
{
  "submissions": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "formId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "formName": "Customer Survey",
      "sessionId": "session-uuid-abc123",
      "status": "completed",
      "data": {
        "user_name": "Jane Smith",
        "user_email": "jane@example.com"
      },
      "metadata": {
        "startedAt": "2024-03-20T15:30:00.000Z",
        "completedAt": "2024-03-20T15:33:45.000Z"
      }
    }
  ],
  "total": 1542,
  "page": 1,
  "limit": 100
}
```

---

## Chat API (Public)

Public endpoints for form chat interface. No authentication required.

### Start Session

Start a new chat session for a form.

**Endpoint:** `POST /api/chat/:publicUrl/session`

**Authentication:** None

**Request Body:** (Optional)
```json
{
  "referrer": "https://google.com",
  "metadata": {
    "source": "email-campaign"
  }
}
```

**Response (201 Created):**
```json
{
  "sessionId": "session-uuid-abc123",
  "form": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Customer Survey",
    "settings": {
      "brandColor": "#667eea",
      "welcomeMessage": "Welcome!",
      "typingDelay": "normal"
    }
  },
  "currentStepIndex": 0,
  "currentStep": {
    "id": "uuid-step-1",
    "order": 0,
    "type": "info",
    "display": {
      "messages": [{ "text": "Welcome!" }]
    }
  },
  "collectedData": {}
}
```

**Errors:**
- `404` - Form not found or not published

---

### Submit Answer

Submit an answer for the current step and get the next step.

**Endpoint:** `POST /api/chat/:publicUrl/answer`

**Authentication:** None

**Request Body:**
```json
{
  "sessionId": "session-uuid-abc123",
  "stepId": "uuid-step-2",
  "answer": "Jane Smith",
  "replayStepId": null
}
```

**For Replay Steps:**
```json
{
  "sessionId": "session-uuid-abc123",
  "stepId": "uuid-target-step",
  "answer": "New answer",
  "replayStepId": "uuid-replay-step"
}
```

**Response (200 OK - Next Step):**
```json
{
  "nextStep": {
    "id": "uuid-step-3",
    "order": 2,
    "type": "stringInput",
    "display": {
      "messages": [{ "text": "What's your email?" }]
    },
    "input": {
      "type": "text",
      "dataType": "email",
      "placeholder": "you@example.com"
    }
  },
  "isComplete": false,
  "collectedData": {
    "user_name": "Jane Smith"
  }
}
```

**Response (200 OK - Form Complete):**
```json
{
  "nextStep": null,
  "isComplete": true,
  "collectedData": {
    "user_name": "Jane Smith",
    "user_email": "jane@example.com",
    "satisfaction": 5
  },
  "thankYouMessage": "Thank you for your feedback!"
}
```

**Response (400 Bad Request - Validation Error):**
```json
{
  "validationError": "Email is required",
  "nextStep": null,
  "isComplete": false
}
```

**Errors:**
- `400` - Validation error
- `404` - Form or session not found
- `410` - Session expired

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for resource |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `LIMIT_EXCEEDED` | 403 | Subscription limit exceeded |
| `SESSION_EXPIRED` | 410 | Chat session expired |

---

## Rate Limiting

Currently no rate limiting is implemented. Recommended for production:

- **Authentication endpoints:** 5 requests per minute per IP
- **Form CRUD:** 60 requests per minute per user
- **Chat endpoints:** 30 requests per minute per session

---

## Webhooks (Future)

Webhook support planned for:
- Form submission completed
- Form published
- Daily submission summary

---

## Related Guides

- [Database Schema](./database-schema.md) - Understanding data structures
- [Deployment Guide](./deployment.md) - API deployment
- [README](../README.md) - Getting started
