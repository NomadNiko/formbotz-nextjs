# Conditional Logic & Branching

FormBotz supports powerful conditional logic to create dynamic, personalized form experiences. This guide covers both show/hide logic and branching.

## Overview

**Two Types of Conditional Logic:**
1. **Show/Hide Logic** - Control step visibility based on conditions
2. **Branching Logic** - Route users to different steps based on their answers

---

## Show/Hide Logic (Conditional Display)

### Purpose
Show a step only when specific conditions are met. Hidden steps are completely skipped.

### Use Cases
- Follow-up questions based on previous answers
- Qualification checks
- Personalized paths
- Error recovery flows

### Configuration

1. In the Step Editor, scroll to **"Conditional Logic"**
2. Toggle **"Enable Conditional Logic"**
3. Add conditions:
   - **Variable Name**: The variable to check (must be collected in a previous step)
   - **Operator**: Comparison type
   - **Value**: The value to compare against
4. Choose **Logical Operator**:
   - **AND**: All conditions must be true
   - **OR**: Any condition can be true

### Available Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `satisfaction equals 5` |
| `notEquals` | Not equal | `recommend notEquals true` |
| `contains` | String contains substring | `feedback contains "bug"` |
| `notContains` | String doesn't contain | `feedback notContains "satisfied"` |
| `greaterThan` | Numeric greater than | `age greaterThan 18` |
| `lessThan` | Numeric less than | `score lessThan 50` |
| `greaterThanOrEqual` | ≥ | `rating greaterThanOrEqual 4` |
| `lessThanOrEqual` | ≤ | `attempts lessThanOrEqual 3` |
| `in` | Value in array | `category in ["A", "B"]` |
| `notIn` | Value not in array | `status notIn ["banned"]` |

### Examples

**Example 1: Follow-up for Negative Feedback**
```
Step 1: Multiple Choice
  Message: "How satisfied are you?"
  Choices: Very Satisfied (5), Satisfied (4), Neutral (3), Dissatisfied (2), Very Dissatisfied (1)
  Variable: satisfaction

Step 2: String Input
  Message: "We're sorry to hear that. What went wrong?"
  Variable: negativeFeedback
  Conditional Logic:
    Show if: satisfaction lessThanOrEqual 2
```

**Example 2: Multiple Conditions with OR**
```
Step 3: Info
  Message: "We see you're not completely satisfied. Let us help!"
  Conditional Logic:
    Show if:
      - satisfaction equals 2
      OR
      - satisfaction equals 3
    Operator: OR
```

**Example 3: Multiple Conditions with AND**
```
Step 4: String Input
  Message: "Since you're a premium customer who's dissatisfied, please provide your ticket number for priority support."
  Variable: ticketNumber
  Conditional Logic:
    Show if:
      - customerType equals "premium"
      AND
      - satisfaction lessThan 3
    Operator: AND
```

---

## Branching Logic (Next Step Override)

### Purpose
Route users to different steps based on their answers, creating non-linear flows.

### Use Cases
- Different paths for different user types
- Skip irrelevant sections
- Create decision trees
- Qualification funnels

### Configuration

1. In the Step Editor, scroll to **"Next Step Override"**
2. Toggle **"Enable Next Step Override"**
3. Add routing rules:
   - Click **"Add Rule"**
   - Add conditions (same as show/hide logic)
   - Choose **Target Step** (where to jump)
   - Set **Logical Operator** (AND/OR)
4. Set **Default Next Step** (optional):
   - If no rules match, go to this step
   - Leave blank to proceed to next step in order

### Rule Evaluation
- Rules are evaluated **in order**
- First matching rule wins
- If no rules match, uses default next step or proceeds normally

### Examples

**Example 1: Simple Branch**
```
Step 1: Yes/No
  Message: "Do you have an account?"
  Variable: hasAccount
  Next Step Override:
    If hasAccount equals true:
      → Go to "Login Step"
    If hasAccount equals false:
      → Go to "Registration Step"
```

**Example 2: Multi-way Branch**
```
Step 2: Multiple Choice
  Message: "What's your primary interest?"
  Choices:
    - "Product Info" → value: "product"
    - "Pricing" → value: "pricing"
    - "Support" → value: "support"
  Variable: interest
  Next Step Override:
    If interest equals "product":
      → Go to "Product Info Section" (Step 10)
    If interest equals "pricing":
      → Go to "Pricing Section" (Step 20)
    If interest equals "support":
      → Go to "Support Section" (Step 30)
    Default: Continue to next step
```

**Example 3: Complex Qualification Funnel**
```
Step 3: Multiple Choice
  Message: "What's your annual revenue?"
  Variable: revenue
  Next Step Override:
    Rule 1:
      If revenue greaterThanOrEqual 1000000:
        → Go to "Enterprise Path" (Step 50)
    Rule 2:
      If revenue greaterThanOrEqual 100000 AND revenue lessThan 1000000:
        → Go to "Business Path" (Step 40)
    Rule 3:
      If revenue lessThan 100000:
        → Go to "Startup Path" (Step 30)
```

---

## Combining Show/Hide and Branching

You can use both on the same step for maximum flexibility.

**Example: Conditional Branch**
```
Step 5: Multiple Choice
  Message: "How would you like to be contacted?"
  Choices: Email, Phone, Both
  Variable: contactMethod
  Conditional Logic:
    Show if: interestedInFollowup equals true
  Next Step Override:
    If contactMethod equals "Email":
      → Go to "Email Collection" (Step 10)
    If contactMethod equals "Phone":
      → Go to "Phone Collection" (Step 11)
    If contactMethod equals "Both":
      → Go to "Full Contact Info" (Step 12)
```

---

## Validation

FormBotz validates your conditional logic when saving:

### Errors (Blocking Save)
- ✅ **Undefined Variables**: Conditional logic references variables that are never collected
- ✅ **Variables Not Yet Available**: Condition uses a variable collected in a later step
- ✅ **Invalid Target Steps**: Next step override points to non-existent steps

### Warnings (Non-Blocking)
- ⚠️ **Unreachable Steps**: Steps that can never be shown due to conflicting logic
- ⚠️ **Dead Ends**: Branching paths that skip the closing step

### Variable Availability
**Important Rule**: You can only reference variables collected in **previous steps**.

❌ **Invalid:**
```
Step 1: Conditional Logic checks "userName"
Step 2: Collects "userName"
→ Error: userName not available at Step 1
```

✅ **Valid:**
```
Step 1: Collects "userName"
Step 2: Conditional Logic checks "userName"
→ Valid: userName is available
```

---

## Best Practices

### 1. Keep It Simple
- Avoid deeply nested logic (max 2-3 levels)
- Use clear, descriptive variable names
- Document complex flows

### 2. Test All Paths
- Test every branch before publishing
- Use incognito mode to reset sessions
- Check that all paths reach the closing step

### 3. Handle Edge Cases
- Always provide a default path
- Account for unexpected answers
- Use validation to prevent invalid data

### 4. Optimize User Experience
- Don't ask unnecessary questions
- Skip irrelevant sections with branching
- Use show/hide for contextual follow-ups

### 5. Variable Naming
- Use consistent naming conventions (camelCase recommended)
- Make names descriptive: `userSatisfaction` not `q1`
- Avoid special characters and spaces

---

## Advanced Patterns

### Pattern 1: Progressive Profiling
Collect more data from engaged users:
```
Step 1: Satisfaction rating → Variable: satisfaction

Step 2: Detailed feedback
  Show if: satisfaction lessThan 4
  Variable: detailedFeedback

Step 3: Contact info for follow-up
  Show if: satisfaction lessThan 3
  Variable: contactEmail
```

### Pattern 2: Skip Logic Chain
Skip entire sections based on qualification:
```
Step 1: "Are you a current customer?"
  Variable: isCustomer

Steps 2-5: Customer-specific questions
  All have: Show if isCustomer equals true

Step 6: New customer welcome
  Show if: isCustomer equals false
```

### Pattern 3: Scoring & Routing
Calculate implicit scores and route accordingly:
```
Step 1-3: Qualification questions
  Collect: q1, q2, q3

Step 4: Calculate score (in Next Step Override logic)
  If q1 equals "yes" AND q2 equals "yes" AND q3 greaterThan 5:
    → Go to "Qualified Lead Path"
  Else:
    → Go to "Nurture Path"
```

---

## Troubleshooting

### Common Issues

**Issue**: Conditional logic doesn't work
- ✅ Check that variable is collected in a **previous** step
- ✅ Verify variable name matches exactly (case-sensitive)
- ✅ Check operator is appropriate for data type (e.g., don't use `greaterThan` on strings)

**Issue**: Step never shows
- ✅ Review all conditions - are they mutually exclusive?
- ✅ Check logical operator (AND vs OR)
- ✅ Test with different answer combinations

**Issue**: Wrong next step
- ✅ Check rule order - first match wins
- ✅ Verify target step ID is correct
- ✅ Check default next step setting

**Issue**: Validation errors on save
- ✅ Read error messages carefully
- ✅ Fix variable references (collect them earlier)
- ✅ Remove references to deleted steps

---

## Related Guides

- [Step Types Guide](./step-types.md) - Learn about all step types
- [Variable Interpolation Guide](./variable-interpolation.md) - Use variables in messages
- [Replay Steps](./step-types.md#5-replay) - Loop back to previous steps
