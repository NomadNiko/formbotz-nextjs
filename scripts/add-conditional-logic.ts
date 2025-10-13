import { ConditionalOperator, LogicalOperator } from '../types';

const formId = '68ed5c0d56eef324d7a364a9';

async function addConditionalLogic() {
  try {
    // Fetch the form
    const response = await fetch(`http://localhost:3000/api/forms/${formId}`, {
      headers: {
        Cookie: process.env.COOKIE || '',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch form:', await response.text());
      process.exit(1);
    }

    const { form } = await response.json();
    console.log(`Fetched form: ${form.name}`);
    console.log(`Number of steps: ${form.steps.length}`);

    // Add conditional logic to step 5 (index 4) - "Would you like to tell us what went wrong?"
    // Should only show if serviceRating <= 3
    if (form.steps[4]) {
      form.steps[4].conditionalLogic = {
        showIf: [
          {
            variableName: 'serviceRating',
            operator: ConditionalOperator.LESS_THAN_OR_EQUAL,
            value: '3',
          },
        ],
        operator: LogicalOperator.AND,
      };
      console.log('Added conditional logic to step 5 (Yes/No - explain)');
    }

    // Add conditional logic to step 6 (index 5) - "Please tell us what went wrong"
    // Should only show if serviceRating <= 3 AND wantsToExplain === true
    if (form.steps[5]) {
      form.steps[5].conditionalLogic = {
        showIf: [
          {
            variableName: 'serviceRating',
            operator: ConditionalOperator.LESS_THAN_OR_EQUAL,
            value: '3',
          },
          {
            variableName: 'wantsToExplain',
            operator: ConditionalOperator.EQUALS,
            value: 'true',
          },
        ],
        operator: LogicalOperator.AND,
      };
      console.log('Added conditional logic to step 6 (Text Input - detailed feedback)');
    }

    // Save the form back
    const saveResponse = await fetch(`http://localhost:3000/api/forms/${formId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: process.env.COOKIE || '',
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        steps: form.steps,
        settings: form.settings,
      }),
    });

    if (!saveResponse.ok) {
      console.error('Failed to save form:', await saveResponse.text());
      process.exit(1);
    }

    console.log('✅ Successfully added conditional logic to the form!');
    console.log('\nConditional logic summary:');
    console.log('- Step 5: Shows only if serviceRating <= 3');
    console.log('- Step 6: Shows only if serviceRating <= 3 AND wantsToExplain === true');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addConditionalLogic();
