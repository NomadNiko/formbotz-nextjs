# Step Types Guide

This guide covers all available step types in FormBotz and how to configure them.

## Available Step Types

### 1. Info
**Purpose:** Display-only message with no user input required.

**Use Cases:**
- Welcome messages
- Instructions
- Informational content
- Section dividers

**Configuration:**
- Input Type: None
- User clicks "Continue" to proceed
- No data collection

**Example:**
```
Step Type: Info
Message: "Welcome to our survey! This will take about 2 minutes."
Input: None
```

---

### 2. Multiple Choice
**Purpose:** User selects one option from predefined choices.

**Use Cases:**
- Satisfaction ratings
- Category selection
- Product preferences
- Yes/No questions (use Yes/No type instead)

**Configuration:**
- Input Type: Choice
- Add multiple options with Label and Value
- Optional: Add redirect URL per choice
- Collect data with variable name

**Example:**
```
Step Type: Multiple Choice
Message: "How satisfied are you with our service?"
Choices:
  - Label: "Very Satisfied", Value: 5
  - Label: "Satisfied", Value: 4
  - Label: "Neutral", Value: 3
  - Label: "Dissatisfied", Value: 2
  - Label: "Very Dissatisfied", Value: 1
Variable: satisfaction
```

---

### 3. Yes/No
**Purpose:** Binary true/false choice.

**Use Cases:**
- Confirmation questions
- Simple boolean decisions
- Qualification questions

**Configuration:**
- Input Type: Choice
- Two predefined choices: Yes (true), No (false)
- Collect data with variable name

**Example:**
```
Step Type: Yes/No
Message: "Would you recommend us to a friend?"
Choices:
  - Label: "Yes", Value: true
  - Label: "No", Value: false
Variable: recommend
```

---

### 4. String Input
**Purpose:** Free-text input from user.

**Use Cases:**
- Name collection
- Email addresses
- Phone numbers
- Open-ended feedback
- Numeric values

**Configuration:**
- Input Type: Text
- Data Type: Choose validation type (freetext, email, phone, number, etc.)
- Placeholder: Gray text shown in empty input
- Validation rules: Required, min/max length, regex pattern
- Collect data with variable name

**Available Data Types:**
- `freetext` - Any text
- `name` - Person's name
- `email` - Email address (auto-validates)
- `phone` - Phone number
- `address` - Physical address
- `number` - Numeric value only
- `dateOfBirth` - Date format
- `customDate` - Custom date format

**Example:**
```
Step Type: String Input
Message: "What's your email address?"
Input Type: Text
Data Type: email
Placeholder: "you@example.com"
Validation: Required
Variable: userEmail
```

---

### 5. Replay
**Purpose:** Re-display a previous step to collect the same data again or allow users to change their answer.

**Use Cases:**
- "Change your answer" functionality
- Re-collecting data after showing consequences
- Looping through similar questions
- Allowing corrections

**How It Works:**
1. When executed, displays the **target step** (chosen from previous steps)
2. User sees the exact same question/choices as the original step
3. Collects answer and stores it in the **same variable** as the target step
4. Returns to the position **after** the Replay step in the flow
5. Can use conditional logic to skip if not needed

**Configuration:**
- Select a **Target Step** from previous steps (by step ID)
- Cannot target steps that come later
- Can add conditional logic to show/hide
- Target selection shows: "Step X: [Type] - [Variable Name]"

**Important Notes:**
- Replay steps use **step IDs** (not order numbers) so they remain valid after reordering
- If target step is deleted, validation will detect and remove the broken reference
- The replay step itself doesn't collect data - it uses the target step's collection settings

**Example:**
```
Step 1: Multiple Choice
  Message: "How satisfied are you?"
  Choices: Very Satisfied (5), Satisfied (4), Neutral (3), Dissatisfied (2), Very Dissatisfied (1)
  Variable: satisfaction

Step 2: Info
  Message: "Based on your rating of {{satisfaction}}, we'd like to offer you a chance to reconsider."
  Conditional Logic: Show if satisfaction ≤ 2

Step 3: Replay
  Message: "Would you like to change your satisfaction rating?"
  Target Step: Step 1 (satisfaction)
  Conditional Logic: Show if satisfaction ≤ 2

→ User sees Step 1 again, can change answer, then proceeds to Step 4
```

**Validation:**
- On save, FormBotz validates all replay targets
- Broken targets (deleted steps) are automatically removed
- Targets pointing to later steps are flagged and removed
- Validation messages show which steps had issues

---

### 6. Closing
**Purpose:** Final thank-you or completion message.

**Use Cases:**
- Thank you message
- Next steps information
- Confirmation of submission
- Call to action

**Configuration:**
- Input Type: None
- Typically uses variable interpolation for personalization
- Last step in the form

**Example:**
```
Step Type: Closing
Message: "Thank you, {{userName}}! We've received your feedback and will be in touch at {{userEmail}} within 24 hours."
Input: None
```

---

## Output Types

All step types can use these display formats:

- **String Question** - Plain text message (default)
- **String Info** - Informational text
- **Single Image** - Display one image
- **Image Carousel** - Multiple images slideshow
- **Links** - Display clickable links
- **Button List** - Multiple choice as buttons

---

## Step Features Available to All Types

### Conditional Logic
Show/hide steps based on collected data.

[See Conditional Logic Guide](./conditional-logic.md)

### Variable Interpolation
Insert collected data into messages using `{{variableName}}`.

[See Variable Interpolation Guide](./variable-interpolation.md)

### Next Step Override
Branch to different steps based on answers (branching logic).

[See Conditional Logic Guide](./conditional-logic.md#branching-logic)

---

## Tips for Choosing Step Types

1. **Use Info for context** - Set expectations before asking questions
2. **Use Multiple Choice for structured data** - Easier to analyze than free text
3. **Use String Input sparingly** - Each text input adds friction
4. **Use Yes/No for qualifications** - Binary questions are quick to answer
5. **Use Replay for corrections** - Better UX than forcing users to start over
6. **Use Closing for confirmation** - Reassure users their submission was received

---

## Step Validation

FormBotz validates your steps when saving:

**Errors (blocking):**
- Conditional logic references undefined variables
- Next step override targets non-existent steps
- Replay targets deleted or later steps

**Warnings (non-blocking):**
- Variables in message text that don't exist anywhere
- Variables in message text not yet collected at that step

[See Variable Validation Guide](./variable-interpolation.md#validation)
