# Database Schema

FormBotz uses MongoDB with Mongoose ODM for data persistence. This guide documents all collections and their schemas.

## Collections Overview

- **users** - User accounts and authentication
- **forms** - Form definitions with steps and logic
- **submissions** - Form submission data and history

---

## Users Collection

Stores user accounts, authentication data, and subscription information.

### Schema

```typescript
{
  _id: ObjectId,
  email: string,                    // Unique, indexed, lowercase
  passwordHash: string,              // bcrypt hashed (10 rounds)
  name: string,                      // Display name
  role: "client" | "admin",          // User role

  subscription: {
    plan: "free" | "pro" | "enterprise",
    formsLimit: number,              // Max forms allowed
    submissionsLimit: number,        // Max submissions per form
    validUntil?: Date                // Subscription expiry (null = forever)
  },

  createdAt: Date,                   // Auto-generated
  updatedAt: Date                    // Auto-updated
}
```

### Indexes

```javascript
email: { unique: true, index: true }
```

### Validation Rules

- **email**: Required, must be valid email format, unique
- **passwordHash**: Required, min length 60 chars
- **name**: Required, min length 2 chars
- **role**: Enum: `["client", "admin"]`, default `"client"`
- **subscription.plan**: Enum: `["free", "pro", "enterprise"]`, default `"free"`

### Default Values

```typescript
{
  role: "client",
  subscription: {
    plan: "free",
    formsLimit: 5,
    submissionsLimit: 100,
    validUntil: null
  }
}
```

### Example Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "john@example.com",
  "passwordHash": "$2a$10$abcdef...",
  "name": "John Doe",
  "role": "client",
  "subscription": {
    "plan": "pro",
    "formsLimit": 50,
    "submissionsLimit": 10000,
    "validUntil": "2025-12-31T23:59:59.999Z"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Forms Collection

Stores form definitions including steps, conditional logic, and settings.

### Schema

```typescript
{
  _id: ObjectId,
  clientId: string,                  // User ID (reference to users._id), indexed
  name: string,                      // Form name
  description?: string,              // Optional description
  publicUrl: string,                 // Unique slug for public access, indexed
  status: "draft" | "published" | "archived",

  steps: Step[],                     // Array of step objects (see below)

  settings: {
    brandColor?: string,             // Hex color code
    backgroundImageUrl?: string,     // Full URL to image
    useDarkText?: boolean,           // For light brand colors
    logoUrl?: string,                // Logo image URL
    typingDelay?: "none" | "short" | "normal",
    welcomeMessage?: string,         // Shown before first step
    thankYouMessage?: string,        // Shown after completion
    enableProgressBar?: boolean,     // Show step progress
    allowBackNavigation?: boolean    // Allow editing previous answers
  },

  stats: {
    views: number,                   // Form page loads
    starts: number,                  // Users who started (answered first step)
    completions: number,             // Users who finished
    completionRate: number,          // (completions / starts) * 100
    averageTimeToComplete?: number   // Average time in seconds
  },

  createdAt: Date,
  updatedAt: Date
}
```

### Step Schema

```typescript
{
  id: string,                        // UUID v4
  order: number,                     // 0-indexed position
  type: "info" | "multipleChoice" | "yesNo" | "stringInput" | "replay" | "closing",

  display: {
    messages: [
      {
        text: string,                // Message text (supports {{variables}})
        delay?: number               // Optional delay in ms before showing
      }
    ],
    media?: {
      type: "image" | "video" | "carousel",
      items: [
        {
          url: string,
          alt?: string,
          caption?: string
        }
      ]
    },
    links?: [
      {
        label: string,
        url: string,
        openInNewTab?: boolean
      }
    ]
  },

  input?: {
    type: "text" | "choice" | "none",
    dataType?: "freetext" | "name" | "email" | "phone" | "address" |
               "number" | "dateOfBirth" | "customDate" | "url" | "ssn" | "zipCode",
    choices?: [
      {
        id: string,                  // UUID v4
        label: string,               // Display text
        value: string | number | boolean,  // Stored value
        redirectUrl?: string,        // Optional redirect on selection
        icon?: string                // Optional icon/emoji
      }
    ],
    validation?: [
      {
        type: "required" | "minLength" | "maxLength" | "pattern" | "custom",
        value?: any,
        errorMessage?: string
      }
    ],
    placeholder?: string,
    helperText?: string
  },

  collect?: {
    enabled: boolean,
    variableName: string,            // Variable name for interpolation
    storageKey: string,              // Database field name
    updateExisting?: boolean         // Allow overwriting existing value
  },

  conditionalLogic?: {
    showIf: [
      {
        variableName: string,
        operator: "equals" | "notEquals" | "contains" | "notContains" |
                  "greaterThan" | "lessThan" | "greaterThanOrEqual" |
                  "lessThanOrEqual" | "in" | "notIn",
        value: any
      }
    ],
    operator: "AND" | "OR"           // How to combine multiple conditions
  },

  nextStepOverride?: {
    rules: [
      {
        conditions: [
          {
            variableName: string,
            operator: string,
            value: any
          }
        ],
        operator: "AND" | "OR",
        targetStepId: string         // Step ID to jump to
      }
    ],
    default?: string                 // Default step ID if no rules match
  },

  replayTarget?: string              // For replay type: target step ID
}
```

### Indexes

```javascript
clientId: { index: true }
publicUrl: { unique: true, index: true }
status: { index: true }
```

### Validation Rules

- **name**: Required, min length 3 chars
- **publicUrl**: Required, unique, only alphanumeric and hyphens
- **status**: Enum: `["draft", "published", "archived"]`, default `"draft"`
- **steps**: Array, min 1 step required
- **clientId**: Required, must reference valid user

### Example Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "clientId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Customer Satisfaction Survey",
  "description": "Monthly customer feedback form",
  "publicUrl": "customer-survey-2024",
  "status": "published",
  "steps": [
    {
      "id": "uuid-step-1",
      "order": 0,
      "type": "info",
      "display": {
        "messages": [
          { "text": "Welcome! This will take 2 minutes." }
        ]
      },
      "input": { "type": "none" }
    },
    {
      "id": "uuid-step-2",
      "order": 1,
      "type": "stringInput",
      "display": {
        "messages": [
          { "text": "What's your name?" }
        ]
      },
      "input": {
        "type": "text",
        "dataType": "name",
        "placeholder": "John Doe",
        "validation": [
          {
            "type": "required",
            "errorMessage": "Name is required"
          }
        ]
      },
      "collect": {
        "enabled": true,
        "variableName": "userName",
        "storageKey": "user_name"
      }
    }
  ],
  "settings": {
    "brandColor": "#667eea",
    "typingDelay": "normal",
    "enableProgressBar": true
  },
  "stats": {
    "views": 1250,
    "starts": 892,
    "completions": 734,
    "completionRate": 82.3
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-03-20T14:22:00.000Z"
}
```

---

## Submissions Collection

Stores form submission data, session history, and analytics.

### Schema

```typescript
{
  _id: ObjectId,
  formId: string,                    // Form ID (reference to forms._id), indexed
  sessionId: string,                 // Unique session ID, indexed
  status: "in-progress" | "completed" | "abandoned",

  data: {
    [storageKey: string]: any        // Dynamic key-value pairs from form
  },

  metadata: {
    startedAt: Date,                 // When user started
    completedAt?: Date,              // When user finished (null if in-progress)
    ipAddress?: string,              // User's IP (hashed for privacy)
    userAgent?: string,              // Browser user agent
    referrer?: string,               // Where user came from
    conversions: string[],           // Step IDs with conversion tracking
    timeSpentPerStep: [
      {
        stepId: string,
        seconds: number
      }
    ]
  },

  stepHistory: [
    {
      stepId: string,                // Step ID that was answered
      answeredAt: Date,              // Timestamp
      answer: any,                   // User's answer
      variableName?: string          // Variable name (if collected)
    }
  ],

  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
formId: { index: true }
sessionId: { unique: true, index: true }
status: { index: true }
"metadata.startedAt": { index: true }
"metadata.completedAt": { index: true }
```

### Validation Rules

- **formId**: Required, must reference valid form
- **sessionId**: Required, unique, UUID format
- **status**: Enum: `["in-progress", "completed", "abandoned"]`, default `"in-progress"`

### Status Transitions

```
in-progress → completed   (user finishes form)
in-progress → abandoned   (user leaves, auto after 24h inactivity)
```

### Example Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "formId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "sessionId": "session-uuid-abc123",
  "status": "completed",
  "data": {
    "user_name": "Jane Smith",
    "user_email": "jane@example.com",
    "satisfaction": 5,
    "would_recommend": true,
    "feedback": "Great service!"
  },
  "metadata": {
    "startedAt": "2024-03-20T15:30:00.000Z",
    "completedAt": "2024-03-20T15:33:45.000Z",
    "ipAddress": "hashed-ip-address",
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://google.com",
    "conversions": ["uuid-step-5"],
    "timeSpentPerStep": [
      { "stepId": "uuid-step-1", "seconds": 5 },
      { "stepId": "uuid-step-2", "seconds": 12 },
      { "stepId": "uuid-step-3", "seconds": 8 },
      { "stepId": "uuid-step-4", "seconds": 140 }
    ]
  },
  "stepHistory": [
    {
      "stepId": "uuid-step-2",
      "answeredAt": "2024-03-20T15:30:12.000Z",
      "answer": "Jane Smith",
      "variableName": "userName"
    },
    {
      "stepId": "uuid-step-3",
      "answeredAt": "2024-03-20T15:30:24.000Z",
      "answer": "jane@example.com",
      "variableName": "userEmail"
    },
    {
      "stepId": "uuid-step-4",
      "answeredAt": "2024-03-20T15:30:32.000Z",
      "answer": 5,
      "variableName": "satisfaction"
    }
  ],
  "createdAt": "2024-03-20T15:30:00.000Z",
  "updatedAt": "2024-03-20T15:33:45.000Z"
}
```

---

## Database Connection

### Connection String Format

**Local:**
```
mongodb://localhost:27017/formbotz
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/formbotz?retryWrites=true&w=majority
```

### Connection Options

```typescript
{
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}
```

---

## Querying Examples

### Find Forms by User
```javascript
const forms = await Form.find({
  clientId: userId,
  status: { $in: ['draft', 'published'] }
}).sort({ updatedAt: -1 });
```

### Find Submissions by Form
```javascript
const submissions = await Submission.find({
  formId: formId,
  status: 'completed'
}).sort({ 'metadata.completedAt': -1 });
```

### Get Form with Steps
```javascript
const form = await Form.findOne({ publicUrl: 'customer-survey' })
  .select('name steps settings');
```

### Aggregate Submission Stats
```javascript
const stats = await Submission.aggregate([
  { $match: { formId: ObjectId(formId) } },
  { $group: {
    _id: '$status',
    count: { $sum: 1 }
  }}
]);
```

---

## Backup & Restore

### Backup
```bash
mongodump --uri="mongodb://localhost:27017/formbotz" --out=/backups/$(date +%Y%m%d)
```

### Restore
```bash
mongorestore --uri="mongodb://localhost:27017/formbotz" /backups/20240320/formbotz
```

### Selective Backup (Specific Collection)
```bash
mongodump --uri="mongodb://localhost:27017/formbotz" --collection=forms --out=/backups/forms
```

---

## Performance Optimization

### Recommended Indexes
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });

// Forms
db.forms.createIndex({ clientId: 1 });
db.forms.createIndex({ publicUrl: 1 }, { unique: true });
db.forms.createIndex({ status: 1 });

// Submissions
db.submissions.createIndex({ formId: 1 });
db.submissions.createIndex({ sessionId: 1 }, { unique: true });
db.submissions.createIndex({ status: 1 });
db.submissions.createIndex({ "metadata.startedAt": 1 });
db.submissions.createIndex({ "metadata.completedAt": 1 });
```

### Compound Indexes
```javascript
// Find user's published forms quickly
db.forms.createIndex({ clientId: 1, status: 1 });

// Find completed submissions by date
db.submissions.createIndex({ formId: 1, status: 1, "metadata.completedAt": -1 });
```

---

## Data Privacy

### PII (Personally Identifiable Information)
- User emails are stored in plain text (required for authentication)
- Form submission data may contain PII depending on form configuration
- IP addresses are hashed before storage
- User agents stored for analytics

### GDPR Compliance
To delete user data:
```javascript
// Delete user account
await User.findByIdAndDelete(userId);

// Delete all forms
await Form.deleteMany({ clientId: userId });

// Delete all submissions
const formIds = await Form.find({ clientId: userId }).distinct('_id');
await Submission.deleteMany({ formId: { $in: formIds } });
```

---

## Related Guides

- [API Reference](./api-reference.md) - API endpoints for database operations
- [Deployment Guide](./deployment.md) - Database setup in production
- [README](../README.md) - Getting started
