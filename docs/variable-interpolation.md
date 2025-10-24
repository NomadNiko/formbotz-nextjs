# Variable Interpolation & Validation

Variables allow you to personalize form messages and create dynamic, contextual experiences. This guide covers variable syntax, validation, and best practices.

## Overview

**Variable Interpolation** means inserting collected data into messages using placeholders.

**Example:**
```
User enters name: "Sarah"
Message template: "Thanks, {{userName}}! We appreciate your feedback."
User sees: "Thanks, Sarah! We appreciate your feedback."
```

---

## Syntax

### Basic Syntax
Use double curly braces: `{{variableName}}`

**Rules:**
- Variable names are **case-sensitive**
- Must match exactly the "Variable Name" from data collection
- No spaces allowed inside braces
- Can use multiple variables in one message

### Examples

**Single Variable:**
```
Message: "Welcome, {{userName}}!"
```

**Multiple Variables:**
```
Message: "We'll send your results to {{userEmail}}. Is that correct, {{userName}}?"
```

**In Questions:**
```
Message: "{{userName}}, on a scale of 1-10, how satisfied are you?"
```

**In Conditional Messages:**
```
Message: "Based on your rating of {{satisfaction}}, we'd like to know more."
```

---

## Variable Collection

### Enabling Data Collection

1. In Step Editor, scroll to **"Data Collection"**
2. Toggle **"Collect and store this data"**
3. Configure:
   - **Variable Name**: Internal reference (e.g., `userName`)
   - **Storage Key**: Database field name (auto-syncs with Variable Name)

### Variable Naming Conventions

**Best Practices:**
- Use `camelCase`: `userName`, `userEmail`, `satisfactionRating`
- Be descriptive: `productChoice` not `answer1`
- Avoid abbreviations unless obvious: `firstName` not `fN`
- No spaces or special characters

**Valid Names:**
```
✅ userName
✅ userEmail
✅ satisfactionRating
✅ hasAccount
✅ contactMethod
```

**Invalid Names:**
```
❌ user name (space)
❌ user-email (hyphen)
❌ User.Email (period)
❌ $email (special character)
```

---

## Variable Availability

### Important Rule
Variables are only available **after** they're collected.

**Valid Flow:**
```
Step 1: Collect "userName"
Step 2: Use {{userName}} ✅
Step 3: Use {{userName}} ✅
```

**Invalid Flow:**
```
Step 1: Use {{userName}} ❌ (not collected yet)
Step 2: Collect "userName"
Step 3: Use {{userName}} ✅
```

### Checking Available Variables

When editing a step, FormBotz shows which variables are available from previous steps. This helps prevent errors.

---

## Validation

FormBotz automatically validates variable usage when you save your form.

### Types of Validation

#### 1. Conditional Logic Validation (Blocking)
**Error Type:** Variables in conditional logic that don't exist or aren't available yet.

**Example Error:**
```
❌ Step 3: Condition references variable "userEmail" which hasn't been collected yet
```

**Fix:** Collect the variable in an earlier step or remove the condition.

#### 2. Message Variable Validation (Warnings)
**Warning Type:** Variables in message text that may cause display issues.

**Two Warning Categories:**

**A) Variable Never Collected**
```
⚠️ Step 5: Variable "{userName}" in message text is never collected in this form
```
**What it means:** You're trying to use a variable that's never collected anywhere.

**What happens:** Users will see the literal text `{userName}` instead of their name.

**Fix:** Either collect the variable or remove it from the message.

**B) Variable Not Yet Available**
```
⚠️ Step 2: Variable "{userEmail}" in message text hasn't been collected yet (will show as {userEmail} to users)
```
**What it means:** The variable exists but is collected in a later step.

**What happens:** Users will see `{userEmail}` until the variable is collected.

**Fix:** Either:
- Collect the variable earlier
- Move the message to a later step
- Use conditional logic to only show after collection

### Validation Messages

When you save a form with issues, you'll see formatted warnings:

```
Replay target issues found and fixed:
  • Step 5 (REPLAY) points to a non-existent step

Variable warnings in message text:
  • Step 3: Variable "{userName}" hasn't been collected yet
  • Step 7: Variable "{companyName}" is never collected in this form
```

**These warnings don't prevent saving** - they're informational to help you improve UX.

---

## Data Types & Formatting

### How Variables Display

Variables show **exactly** as the user entered them:

| Data Type | User Enters | Displays As |
|-----------|-------------|-------------|
| Text | "John Smith" | John Smith |
| Email | "john@example.com" | john@example.com |
| Number | "42" | 42 |
| Choice (value) | "very_satisfied" | very_satisfied |
| Choice (label) | Shows value, not label | 5 (not "Very Satisfied") |
| Boolean | true | true |

**Important:** Multiple choice steps store the **value**, not the label.

**Example:**
```
Choice: Label "Very Satisfied", Value "5"
User selects it
{{satisfaction}} → displays "5", not "Very Satisfied"
```

### Empty or Missing Variables

If a variable isn't set or doesn't exist:
- Displays as empty string (nothing)
- No error shown to user
- Just a gap in the text

**Example:**
```
Message: "Welcome back, {{userName}}!"
If userName is empty → "Welcome back, !"
```

---

## Advanced Usage

### Conditional Display with Variables

Combine variables with conditional logic for smart personalization:

```
Step 1: Collect "userName"
Step 2: Collect "isReturningCustomer"

Step 3: Info
  Message: "Welcome back, {{userName}}! Great to see you again."
  Show if: isReturningCustomer equals true

Step 4: Info
  Message: "Welcome, {{userName}}! This is your first time here."
  Show if: isReturningCustomer equals false
```

### Variables in Replay Steps

Replay steps can reference variables from the target step:

```
Step 1: Collect "satisfaction" (value 1-5)

Step 2: Info
  Message: "You rated us {{satisfaction}} out of 5."

Step 3: Replay (targets Step 1)
  Message: "Your current rating is {{satisfaction}}. Would you like to change it?"
  Show if: satisfaction lessThan 3

→ After replay, {{satisfaction}} updates with new value
```

### Chaining Variables

Use multiple variables to build context:

```
Step 1: Collect "firstName"
Step 2: Collect "lastName"
Step 3: Collect "company"
Step 4: Collect "role"

Step 5: Info
  Message: "Perfect! So you're {{firstName}} {{lastName}}, {{role}} at {{company}}. Let's continue..."
```

---

## Best Practices

### 1. Personalize Thoughtfully
✅ **Do:**
- Use names for warm, personal tone
- Reference previous answers for context
- Confirm important information

❌ **Don't:**
- Overuse personalization (feels robotic)
- Use variables in every message
- Reference sensitive data unnecessarily

### 2. Handle Missing Data Gracefully
Instead of:
```
❌ "Thanks, {{userName}}!"
   (if empty → "Thanks, !")
```

Use fallbacks in your step flow:
```
✅ "Thanks for your feedback!"
   OR check if variable exists before showing
```

### 3. Validate Before Publishing
Before publishing your form:
1. Check for variable warnings on save
2. Test with real data in preview mode
3. Try leaving fields empty to test missing variable handling
4. Review all conditional logic paths

### 4. Use Descriptive Names
Good variable names make forms easier to maintain:
```
✅ satisfactionRating
✅ recommendToFriend
✅ productCategory

❌ q1
❌ answer
❌ temp
```

### 5. Document Complex Forms
For forms with many variables:
- Keep a variable reference list
- Document what each variable stores
- Note which steps use each variable
- Map conditional logic dependencies

---

## Troubleshooting

### Issue: Variable Shows as Literal Text
**Symptom:** User sees `{userName}` instead of their name

**Causes:**
1. Variable not collected yet → Move collection earlier
2. Variable name typo → Check spelling
3. Variable never collected → Add data collection
4. Conditional logic skipped collection step → Review logic

### Issue: Empty Gaps in Messages
**Symptom:** "Welcome, !" or "Thanks for your feedback, !"

**Causes:**
1. User didn't provide data (optional field)
2. Variable collected in later step
3. Variable name mismatch

**Fix:** Test with empty data, use neutral messages instead

### Issue: Wrong Value Displays
**Symptom:** Shows "5" instead of "Very Satisfied"

**Cause:** Multiple choice stores value, not label

**Fix:** Use descriptive values like `very_satisfied` instead of `5`, or use conditional logic to show custom messages based on values

### Issue: Validation Warnings Won't Go Away
**Symptom:** Warnings persist after fixing

**Causes:**
1. Variable collected after it's used → Reorder steps
2. Variable in multiple steps → Check all messages
3. Typo in variable name → Match exactly

**Fix:** Use the warning messages to locate specific issues - they show step numbers

---

## Examples

### Example 1: Lead Qualification Form
```
Step 1: "What's your name?"
  Collect: userName

Step 2: "What's your email, {{userName}}?"
  Collect: userEmail

Step 3: "What's your company's annual revenue?"
  Collect: revenue

Step 4: "Thanks, {{userName}}! Based on your revenue of {{revenue}}, we recommend..."
  Show if: revenue greaterThan 1000000
```

### Example 2: Customer Satisfaction Survey
```
Step 1: "What's your name?"
  Collect: userName

Step 2: "How satisfied are you, {{userName}}?"
  Collect: satisfaction (1-5)

Step 3: "We're sorry to hear you rated us {{satisfaction}} out of 5. What went wrong?"
  Collect: feedback
  Show if: satisfaction lessThanOrEqual 2

Step 4: "Thank you for your feedback, {{userName}}! We'll review your comments about '{{feedback}}' and improve."
  Show if: feedback exists
```

### Example 3: Product Configurator
```
Step 1: "What's your name?"
  Collect: userName

Step 2: "Which product interests you, {{userName}}?"
  Choices: Pro ($99), Business ($199), Enterprise ($499)
  Collect: productChoice

Step 3: "How many users?"
  Collect: userCount

Step 4: "Perfect! We'll set up {{productChoice}} for {{userCount}} users. Is {{userEmail}} the best email for the invoice?"
  Collect: confirmEmail
```

---

## Related Guides

- [Step Types Guide](./step-types.md) - Learn about data collection in different step types
- [Conditional Logic Guide](./conditional-logic.md) - Use variables in conditional logic
- [Form Validation](../README.md#validation) - Understanding form validation
