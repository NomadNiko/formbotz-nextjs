# FormBotz

**FormBotz** is a conversational form builder that transforms traditional forms into engaging chatbot-style interfaces. Users answer questions one at a time in a natural, chat-like experience with support for conditional logic, variable interpolation, and branching flows.

Think Typeform meets ChatGPT — but with unlimited customization and control.

---

## 🚀 Features

### Core Features
- ✅ **Conversational Form Builder** - Create forms that feel like conversations
- ✅ **Visual Step Editor** - Drag-and-drop interface for building form flows
- ✅ **Conditional Logic** - Show/hide steps based on previous answers
- ✅ **Variable Interpolation** - Personalize messages using collected data (e.g., "Thanks, {{name}}!")
- ✅ **Branching Logic** - Route users to different steps based on their responses
- ✅ **Multiple Input Types** - Text inputs, multiple choice, yes/no, and display-only steps
- ✅ **Real-time Chat Interface** - Beautiful, responsive chat UI for end users
- ✅ **Progress Tracking** - Optional progress bar showing completion percentage
- ✅ **Typing Indicators** - Configurable typing delays for natural conversation feel
- ✅ **Custom Branding** - Brand colors, background images, and custom messages
- ✅ **Data Validation** - Built-in validation rules (required, min/max length, patterns, custom)
- ✅ **Submission Management** - View, search, and export all form submissions
- ✅ **Export Options** - Download submissions as CSV or JSON
- ✅ **Analytics Dashboard** - Track views, starts, completions, and conversion rates
- ✅ **Session Management** - Persist user sessions across page refreshes
- ✅ **Dark Mode Support** - Full dark mode UI with Flowbite theming

### Technical Features
- Built with **Next.js 15** (App Router)
- **React 19** with TypeScript
- **MongoDB** with Mongoose ODM
- **NextAuth.js** for authentication
- **Tailwind CSS v4** for styling
- **Flowbite React** component library
- Mobile-responsive design
- Production-ready with PM2 support

---

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [How to Use FormBotz](#how-to-use-formbotz)
  - [1. Creating Your First Form](#1-creating-your-first-form)
  - [2. Building Form Steps](#2-building-form-steps)
  - [3. Configuring Input Types](#3-configuring-input-types)
  - [4. Adding Conditional Logic](#4-adding-conditional-logic)
  - [5. Using Variable Interpolation](#5-using-variable-interpolation)
  - [6. Form Settings & Branding](#6-form-settings--branding)
  - [7. Publishing Your Form](#7-publishing-your-form)
  - [8. Viewing Submissions](#8-viewing-submissions)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

---

## 🔧 Installation

### Prerequisites
- **Node.js** 18+ or **Bun** 1.0+
- **MongoDB** database (local or cloud)
- **Git**

### Clone the Repository
```bash
git clone https://github.com/yourusername/formbotz-nextjs.git
cd formbotz-nextjs
```

### Install Dependencies
Using Bun (recommended):
```bash
bun install
```

Using npm/pnpm/yarn:
```bash
npm install
# or
pnpm install
# or
yarn install
```

---

## 🌍 Environment Setup

Create a `.env` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/formbotz
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formbotz?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
# In production:
# NEXTAUTH_URL=https://yourdomain.com

# Optional: Node Environment
NODE_ENV=development
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

---

## 💻 Development

### Start Development Server
```bash
bun dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Other Commands
```bash
# Production build
bun run build

# Start production server
bun run start

# Run linter
bun run lint

# Format code
bun run format

# Check formatting
bun run format:check
```

---

## 📖 How to Use FormBotz

### 1. Creating Your First Form

#### Step 1.1: Register an Account
1. Navigate to `http://localhost:3000/register`
2. Fill in your details:
   - **Name**: Your full name
   - **Email**: Your email address
   - **Password**: Choose a secure password
3. Click **"Create Account"**
4. You'll be automatically logged in and redirected to the dashboard

#### Step 1.2: Create a New Form
1. From the dashboard, click **"Create New Form"**
2. Enter form details:
   - **Form Name**: Give your form a descriptive name (e.g., "Customer Feedback Survey")
   - **Description** (optional): Brief description of the form's purpose
   - **Public URL**: A unique slug for sharing (e.g., "customer-feedback")
3. Click **"Create Form"**

The form is now created in **Draft** status and you'll be taken to the Form Builder.

---

### 2. Building Form Steps

The Form Builder consists of three main sections:
- **Left Panel**: Step list (reorderable)
- **Center Panel**: Step editor (configure selected step)
- **Right Panel**: Form settings and preview

#### Step 2.1: Understanding Step Types

**Step Types Available:**
- **Info**: Display-only message (no user input)
- **Multiple Choice**: User selects from predefined options
- **Yes/No**: Binary choice (true/false)
- **String Input**: Free-text input field
- **Validation**: Verify or confirm data
- **Closing**: Final thank-you message

**Output Types Available:**
- **String Question**: Plain text message
- **String Info**: Informational text
- **Single Image**: Display one image
- **Image Carousel**: Multiple images slideshow
- **Links**: Display clickable links
- **Button List**: Multiple choice as buttons

#### Step 2.2: Adding Steps

1. Click **"Add Step"** button in the left panel
2. A new step appears at the bottom of the list
3. Click on the step to select it
4. Configure the step in the center panel:

**Basic Configuration:**
- **Step Type**: Choose from dropdown (Info, Multiple Choice, Yes/No, String Input, Validation, Closing)
- **Output Type**: How the step appears (String Question, String Info, Single Image, etc.)

**Display Configuration:**
- **Messages**: Add one or more text messages
  - Click **"Add Message"** to add additional messages
  - Use the text area to type your message
  - Messages are displayed sequentially in the chat
- **Message Formatting**:
  - Use line breaks for readability
  - Include variable placeholders like `{{variableName}}`
  - Add links using markdown-like syntax: `[Link Text](https://example.com)`

#### Step 2.3: Reordering Steps

- Drag and drop steps in the left panel to reorder them
- Step order determines the default flow (unless overridden by conditional logic)

#### Step 2.4: Deleting Steps

- Click the **trash icon** next to a step in the left panel
- Confirm deletion
- **Warning**: Deleting steps may break conditional logic references

---

### 3. Configuring Input Types

#### 3.1: Text Input Configuration

For **String Input** step types:

1. Select **Input Type**: "Text"
2. Configure input settings:
   - **Data Type**: Choose how to validate/store the input
     - `freetext`: Any text
     - `name`: Person's name
     - `email`: Email address (auto-validates)
     - `phone`: Phone number
     - `address`: Physical address
     - `number`: Numeric value only
     - `dateOfBirth`: Date format
     - `customDate`: Custom date format
   - **Placeholder Text**: Gray text shown in empty input (e.g., "Enter your email...")
   - **Helper Text**: Small text below input to guide user

3. Add validation rules:
   - **Required**: User must provide an answer
   - **Min Length**: Minimum character count
   - **Max Length**: Maximum character count
   - **Pattern**: Regular expression pattern (e.g., `^\d{3}-\d{2}-\d{4}$` for SSN)
   - **Custom Error Message**: Message shown when validation fails

4. Configure data collection:
   - **Enable Collection**: Toggle on to save this data
   - **Variable Name**: Internal name (e.g., `userName`)
   - **Storage Key**: Database field name (e.g., `user_name`)
   - **Update Existing**: Allow overwriting previous value

**Example Text Input Step:**
```
Step Type: String Input
Output Type: String Question
Message: "What's your email address? We'll send your results there."
Input Type: Text
Data Type: email
Placeholder: "you@example.com"
Validation: Required
Variable Name: userEmail
Storage Key: email
```

#### 3.2: Multiple Choice Configuration

For **Multiple Choice** step types:

1. Select **Input Type**: "Choice"
2. Add choices:
   - Click **"Add Choice"**
   - **Label**: Text shown to user (e.g., "Very Satisfied")
   - **Value**: Stored value (e.g., "5" or "very_satisfied")
   - **Redirect URL** (optional): External URL to redirect after selection
3. Repeat for all options
4. Configure data collection (same as text input)

**Example Multiple Choice Step:**
```
Step Type: Multiple Choice
Output Type: Button List
Message: "How satisfied are you with our service?"
Choices:
  - Label: "Very Satisfied", Value: 5
  - Label: "Satisfied", Value: 4
  - Label: "Neutral", Value: 3
  - Label: "Dissatisfied", Value: 2
  - Label: "Very Dissatisfied", Value: 1
Variable Name: satisfaction
Storage Key: satisfaction_rating
```

#### 3.3: Yes/No Configuration

For **Yes/No** step types:

1. Select **Input Type**: "Choice"
2. Add exactly two choices:
   - **Yes Choice**: Label: "Yes", Value: `true`
   - **No Choice**: Label: "No", Value: `false`
3. Configure data collection

**Example Yes/No Step:**
```
Step Type: Yes/No
Output Type: Button List
Message: "Would you recommend us to a friend?"
Choices:
  - Label: "Yes", Value: true
  - Label: "No", Value: false
Variable Name: recommend
Storage Key: would_recommend
```

#### 3.4: Display-Only (No Input)

For **Info** or **Closing** step types:

1. Select **Input Type**: "None"
2. Only configure messages to display
3. User clicks "Continue" button to proceed
4. No data collection needed

**Example Info Step:**
```
Step Type: Info
Output Type: String Info
Messages:
  - "Welcome to our survey!"
  - "This will take about 2 minutes to complete."
Input Type: None
```

---

### 4. Adding Conditional Logic

Conditional logic allows you to show/hide steps or branch to different steps based on user answers.

#### 4.1: Show/Hide Logic (Conditional Display)

**Use Case**: Only show a step if certain conditions are met.

1. Scroll to **"Conditional Logic"** section in step editor
2. Toggle **"Enable Conditional Logic"**
3. Add conditions:
   - Click **"Add Condition"**
   - **Variable Name**: The variable to check (e.g., `satisfaction`)
   - **Operator**: Comparison operator
     - `equals`: Exact match
     - `notEquals`: Not equal
     - `contains`: String contains substring
     - `notContains`: String doesn't contain substring
     - `greaterThan`: Numeric greater than
     - `lessThan`: Numeric less than
     - `greaterThanOrEqual`: ≥
     - `lessThanOrEqual`: ≤
     - `in`: Value in array
     - `notIn`: Value not in array
   - **Value**: The value to compare against
4. Choose **Logical Operator**:
   - **AND**: All conditions must be true
   - **OR**: Any condition can be true

**Example Conditional Logic:**
```
Show this step only if:
  Condition 1: satisfaction equals 1
  OR
  Condition 2: satisfaction equals 2

→ This step only shows if user selected "Very Dissatisfied" or "Dissatisfied"
```

#### 4.2: Branching Logic (Next Step Override)

**Use Case**: Route users to different steps based on their answers.

1. Scroll to **"Next Step Override"** section
2. Toggle **"Enable Next Step Override"**
3. Add routing rules:
   - Click **"Add Rule"**
   - Add conditions (same as show/hide logic)
   - **Target Step**: Select which step to jump to
   - **Logical Operator**: AND/OR for multiple conditions
4. Set **Default Next Step**:
   - If no rules match, go to this step
   - Leave blank to proceed to the next step in order

**Example Branching Logic:**
```
If recommend equals true:
  → Go to "Thank You - Promoter" step

If recommend equals false:
  → Go to "Feedback Form" step

Default: Continue to next step
```

#### 4.3: Complex Conditional Example

**Scenario**: Create a survey that asks for more details if satisfaction is low.

```
Step 1 (satisfaction):
  Message: "How satisfied are you?"
  Choices: Very Satisfied (5), Satisfied (4), Neutral (3), Dissatisfied (2), Very Dissatisfied (1)
  Variable: satisfaction

Step 2 (feedback-request):
  Message: "We're sorry to hear that. Can you tell us what went wrong?"
  Input: Text
  Variable: negative_feedback
  Conditional Logic:
    Show if: satisfaction lessThanOrEqual 2

Step 3 (improvement-request):
  Message: "What could we do better?"
  Input: Text
  Variable: improvement_suggestions
  Conditional Logic:
    Show if: satisfaction lessThan 4

Step 4 (thank-you):
  Message: "Thank you for your feedback, {{userName}}! We appreciate your time."
  Input: None
```

---

### 5. Using Variable Interpolation

Variable interpolation allows you to personalize messages by inserting collected data.

#### 5.1: Syntax

Use double curly braces: `{{variableName}}`

**Available Variables:**
- Any variable you've collected via data collection
- Variable names are case-sensitive
- Must match exactly the "Variable Name" you configured

#### 5.2: Examples

**Example 1: Personalized Greeting**
```
Step 1:
  Message: "What's your name?"
  Variable: userName

Step 2:
  Message: "Nice to meet you, {{userName}}! Let's get started."
```

**Example 2: Confirmation Message**
```
Step 1:
  Message: "What's your email?"
  Variable: userEmail

Step 2:
  Message: "Perfect! We'll send your results to {{userEmail}}."
```

**Example 3: Multiple Variables**
```
Step 1:
  Message: "What's your first name?"
  Variable: firstName

Step 2:
  Message: "What's your last name?"
  Variable: lastName

Step 3:
  Message: "Thanks, {{firstName}} {{lastName}}! One more question..."
```

#### 5.3: Formatting Tips

- Variables are replaced with the **exact** value the user entered
- If a variable doesn't exist yet, it displays as empty string
- Use variables in any message text, including:
  - Question text
  - Info messages
  - Thank you messages
  - Error messages (custom validation)

---

### 6. Form Settings & Branding

Click the **"Settings"** tab in the right panel to customize your form's appearance and behavior.

#### 6.1: Branding

**Brand Color:**
- Click the color picker
- Choose your primary brand color
- This color is applied to user message bubbles

**Background Image:**
- Enter a full URL to an image (e.g., `https://example.com/bg.jpg`)
- Image covers the entire chat background
- Leave blank for default gray background

**Dark Text:**
- Toggle on if using a light brand color
- Changes text color to black for better contrast

**Logo:**
- Enter a URL to your logo image
- Displays in the chat header (future feature)

#### 6.2: Behavior Settings

**Typing Delay:**
- **No Delay**: Bot messages appear instantly
- **Short Delay** (1.5s): Brief pause before bot responds
- **Normal Delay** (2.5s): Natural conversation timing (recommended)

**Welcome Message:**
- Custom greeting shown when form loads
- Displays before the first step
- Example: "Welcome! Let's get started..."

**Thank You Message:**
- Custom message when form is completed
- Shown after final step
- Example: "Thank you! We'll be in touch soon."

**Progress Bar:**
- Toggle on/off
- Shows "Step X of Y" and visual progress bar
- Helps users understand form length

**Back Navigation:**
- Toggle on/off (future feature)
- Allow users to go back and edit previous answers

#### 6.3: Publishing Settings

**Public URL:**
- Unique identifier for your form
- Users access form at: `https://yourdomain.com/chat/{publicUrl}`
- Must be unique across all forms
- Can only contain letters, numbers, and hyphens
- Example: `customer-feedback-2024`

**Form Status:**
- **Draft**: Not accessible to public, visible only to you
- **Published**: Accessible via public URL
- **Archived**: Hidden from dashboard, data preserved

---

### 7. Publishing Your Form

#### 7.1: Before Publishing Checklist

✅ All required steps are configured
✅ Data collection variables are set
✅ Conditional logic is tested
✅ Messages use proper variable interpolation
✅ Form settings and branding are configured
✅ Public URL is set and unique

#### 7.2: Publish Process

1. Click **"Save"** button to save all changes
2. In the top-right corner, click **"Status: Draft"** dropdown
3. Select **"Published"**
4. Click **"Save"** again
5. Your form is now live!

#### 7.3: Sharing Your Form

**Public URL:**
```
http://localhost:3000/chat/{your-public-url}
```

In production:
```
https://yourdomain.com/chat/{your-public-url}
```

**Share this link:**
- Via email campaigns
- On your website
- In social media posts
- As QR codes
- In SMS messages

#### 7.4: Testing Your Published Form

1. Copy the public URL
2. Open in incognito/private browsing window
3. Complete the form as a user would
4. Check that:
   - All steps appear in correct order
   - Conditional logic works properly
   - Variables are interpolated correctly
   - Validation messages are clear
   - Data is saved correctly

---

### 8. Viewing Submissions

#### 8.1: Accessing Submissions

**View All Submissions (All Forms):**
1. Go to Dashboard
2. Click **"Submissions"** in the sidebar
3. See submissions from all your forms

**View Form-Specific Submissions:**
1. Go to Dashboard → Forms
2. Find your form in the list
3. Click **"View Submissions"**
4. See only submissions for that form

#### 8.2: Submission Details

Each submission shows:
- **Status Badge**:
  - 🟢 **Completed**: User finished the entire form
  - 🟡 **In Progress**: User started but didn't finish
  - ⚫ **Abandoned**: User left without completing
- **Submitted Date**: When the submission was completed (or started)
- **Preview**: Number of fields collected

#### 8.3: Viewing Individual Submissions

1. Click the **"View"** button (eye icon) on any submission
2. A modal opens showing:
   - **Submission ID**: Unique identifier
   - **Status**: Current status
   - **Started At**: Timestamp when user began
   - **Completed At**: Timestamp when user finished (or "In Progress")
   - **Form Data**: All collected key-value pairs

**Form Data Display:**
- Field name (storage key)
- User's answer
- Special formatting:
  - Boolean values show as "Yes" or "No"
  - Empty values show as "(empty)"
  - All other values show as text

#### 8.4: Exporting Submissions

**Export as CSV:**
1. Click **"Export"** dropdown
2. Select **"Export as CSV"**
3. A CSV file downloads with name: `{formName}-submissions-{date}.csv`

**CSV Structure:**
```csv
Submission ID,Status,Started At,Completed At,field1,field2,field3
abc123,completed,2024-01-15 10:30:00,2024-01-15 10:32:15,John,john@example.com,5
def456,in-progress,2024-01-15 11:00:00,In Progress,Jane,jane@example.com,
```

**Export as JSON:**
1. Click **"Export"** dropdown
2. Select **"Export as JSON"**
3. A JSON file downloads with name: `{formName}-submissions-{date}.json`

**JSON Structure:**
```json
[
  {
    "submissionId": "abc123",
    "status": "completed",
    "startedAt": "2024-01-15 10:30:00",
    "completedAt": "2024-01-15 10:32:15",
    "data": {
      "userName": "John",
      "userEmail": "john@example.com",
      "satisfaction": 5
    }
  },
  {
    "submissionId": "def456",
    "status": "in-progress",
    "startedAt": "2024-01-15 11:00:00",
    "completedAt": null,
    "data": {
      "userName": "Jane",
      "userEmail": "jane@example.com"
    }
  }
]
```

#### 8.5: Analyzing Submissions

**Key Metrics (shown on Form page):**
- **Views**: Number of times form was loaded
- **Starts**: Number of users who began filling out the form
- **Completions**: Number of users who finished the form
- **Completion Rate**: (Completions / Starts) × 100%

**Tips for Analysis:**
- Export to CSV and open in Excel/Google Sheets for pivot tables
- Export to JSON for programmatic analysis (Python, JavaScript, etc.)
- Filter by date range (manual filtering in exported file)
- Look for patterns in abandoned submissions to improve form

---

## 📁 Project Structure

```
formbotz-nextjs/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── forms/            # Forms management
│   │       │   ├── [formId]/
│   │       │   │   ├── edit/     # Form builder
│   │       │   │   └── submissions/  # Form submissions
│   │       │   ├── new/          # Create new form
│   │       │   └── page.tsx      # Forms list
│   │       └── submissions/      # All submissions
│   ├── (public)/                 # Public routes
│   │   └── chat/
│   │       └── [publicUrl]/      # Public form chat interface
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── forms/                # Form CRUD operations
│   │   ├── submissions/          # Submission operations
│   │   └── chat/                 # Chat session management
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── builder/                  # Form builder components
│   │   ├── StepEditor.tsx
│   │   ├── StepList.tsx
│   │   └── FormSettings.tsx
│   ├── chat/                     # Chat UI components
│   │   └── TypingIndicator.tsx
│   └── layout/                   # Layout components
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── lib/                          # Utility libraries
│   ├── db/
│   │   ├── models/               # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Form.ts
│   │   │   └── Submission.ts
│   │   └── mongoose.ts           # Database connection
│   ├── auth/                     # Auth utilities
│   │   └── requireAuth.ts
│   └── utils/                    # Utility functions
│       ├── conditionalLogic.ts   # Evaluate conditions
│       ├── interpolation.ts      # Variable interpolation
│       ├── linkParser.ts         # Parse markdown links
│       └── stepHelpers.ts        # Step navigation helpers
├── types/
│   └── index.ts                  # TypeScript type definitions
├── .env                          # Environment variables
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 🗄️ Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  email: string,                    // Unique, indexed
  passwordHash: string,              // bcrypt hashed
  name: string,
  role: "client" | "admin",
  subscription: {
    plan: "free" | "pro" | "enterprise",
    formsLimit: number,
    submissionsLimit: number,
    validUntil?: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Forms Collection

```typescript
{
  _id: ObjectId,
  clientId: string,                  // User ID, indexed
  name: string,
  description?: string,
  publicUrl: string,                 // Unique, indexed
  status: "draft" | "published" | "archived",

  steps: [                           // Array of step objects
    {
      id: string,
      order: number,
      type: "info" | "multipleChoice" | "yesNo" | "stringInput" | "validation" | "closing",
      outputType: "stringQuestion" | "stringInfo" | "singleImage" | "imageCarousel" | "links" | "buttonList",

      display: {
        messages: [{ text: string, delay?: number }],
        media?: { type: string, items: MediaItem[] },
        links?: LinkItem[]
      },

      input?: {
        type: "text" | "choice" | "none",
        dataType?: "freetext" | "name" | "email" | "phone" | "number" | etc.,
        choices?: ChoiceOption[],
        validation?: ValidationRule[],
        placeholder?: string,
        helperText?: string
      },

      collect?: {
        enabled: boolean,
        variableName: string,
        storageKey: string,
        updateExisting?: boolean
      },

      conditionalLogic?: {
        showIf: Condition[],
        operator: "AND" | "OR"
      },

      nextStepOverride?: {
        rules: NextStepRule[],
        default?: string
      }
    }
  ],

  settings: {
    brandColor?: string,
    backgroundImageUrl?: string,
    useDarkText?: boolean,
    typingDelay?: "none" | "short" | "normal",
    welcomeMessage?: string,
    thankYouMessage?: string,
    enableProgressBar?: boolean,
    allowBackNavigation?: boolean
  },

  stats: {
    views: number,
    starts: number,
    completions: number,
    completionRate: number,
    averageTimeToComplete?: number
  },

  createdAt: Date,
  updatedAt: Date
}
```

### Submissions Collection

```typescript
{
  _id: ObjectId,
  formId: string,                    // Form ID, indexed
  sessionId: string,                 // Unique session ID
  status: "in-progress" | "completed" | "abandoned",

  data: {                            // Dynamic key-value pairs
    [storageKey: string]: any
  },

  metadata: {
    startedAt: Date,
    completedAt?: Date,
    ipAddress?: string,
    userAgent?: string,
    conversions: string[],           // Step IDs with conversion tracking
    timeSpentPerStep: [
      { stepId: string, seconds: number }
    ]
  },

  stepHistory: [
    {
      stepId: string,
      answeredAt: Date,
      answer: any,
      variableName?: string
    }
  ],

  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌐 API Endpoints

### Authentication

**POST** `/api/auth/register`
- Register new user account
- Body: `{ name, email, password }`

**POST** `/api/auth/[...nextauth]`
- NextAuth.js authentication endpoints
- Handles login, logout, session management

### Forms

**GET** `/api/forms`
- Get all forms for authenticated user
- Returns: `{ forms: Form[] }`

**POST** `/api/forms`
- Create new form
- Body: `{ name, description?, publicUrl }`
- Returns: `{ form: Form }`

**GET** `/api/forms/[formId]`
- Get single form by ID
- Returns: `{ form: Form }`

**PUT** `/api/forms/[formId]`
- Update form
- Body: `{ name?, description?, steps?, settings?, status? }`
- Returns: `{ form: Form }`

**DELETE** `/api/forms/[formId]`
- Delete form
- Returns: `{ success: true }`

**GET** `/api/forms/[formId]/submissions`
- Get all submissions for a form
- Returns: `{ form: Form, submissions: Submission[] }`

### Submissions

**GET** `/api/submissions`
- Get all submissions for authenticated user (across all forms)
- Returns: `{ submissions: Submission[] }`

### Chat (Public API)

**POST** `/api/chat/[publicUrl]/session`
- Start new chat session
- Creates new submission record
- Returns: `{ sessionId, form, currentStepIndex, collectedData }`

**POST** `/api/chat/[publicUrl]/answer`
- Submit answer for current step
- Body: `{ sessionId, stepId, answer }`
- Validates answer, evaluates logic, determines next step
- Returns: `{ nextStep?, isComplete, validationError?, collectedData }`

---

## 🚀 Deployment

### Environment Variables (Production)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/formbotz
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

### Build and Deploy

```bash
# Build for production
bun run build

# Start production server
bun run start

# Or use PM2 for process management
pm2 start ecosystem.config.js
```

### Deployment Platforms

**Vercel (Recommended for Next.js):**
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

**Railway:**
1. Connect GitHub repository
2. Add MongoDB plugin or external connection
3. Configure environment variables
4. Deploy

**DigitalOcean App Platform:**
1. Connect GitHub repository
2. Use managed MongoDB
3. Configure environment variables
4. Deploy

**Self-Hosted (VPS):**
1. Install Node.js/Bun
2. Install MongoDB
3. Clone repository
4. Set environment variables
5. Build and run with PM2
6. Configure Nginx reverse proxy
7. Set up SSL with Let's Encrypt

---

## 🔐 Security Notes

- Passwords are hashed using **bcryptjs** (10 rounds)
- Sessions use **JWT tokens** (stored in httpOnly cookies)
- CSRF protection enabled via NextAuth.js
- MongoDB connection uses authentication
- Environment variables never committed to git
- Rate limiting recommended for production (not included)
- Input validation on both client and server side

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 💬 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: support@formbotz.com
- Documentation: https://docs.formbotz.com (coming soon)

---

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flowbite React](https://flowbite-react.com/)
- [MongoDB](https://www.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Mongoose](https://mongoosejs.com/)

---

**Happy form building! 🚀**
