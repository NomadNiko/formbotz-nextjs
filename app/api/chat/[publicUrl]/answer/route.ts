import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Form, Submission, User } from '@/lib/db/models';
import { getNextStep } from '@/lib/utils/conditionalLogic';
import { validateInput } from '@/lib/utils/validation';
import { sendSubmissionNotification } from '@/lib/utils/email';
import { formatByDataType } from '@/lib/utils/formatting';
import { format } from 'date-fns';

// POST /api/chat/[publicUrl]/answer - Submit an answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicUrl: string }> }
) {
  await params; // Await params to comply with Next.js 15
  try {
    const body = await request.json();
    const { sessionId, stepId, answer } = body;

    if (!sessionId || !stepId) {
      return NextResponse.json(
        { error: 'Session ID and step ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find submission
    const submission = await Submission.findOne({ sessionId });
    if (!submission) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Find form
    const form = await Form.findById(submission.formId);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Find the step
    const step = form.steps.find((s: { id: string }) => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    // Get collected data before validation - Convert Mongoose Map to plain object
    let collectedData = Object.fromEntries(
      Array.from(submission.data.entries())
    ) as Record<string, unknown>;

    // Format and validate input if step has data collection with specific data type
    let formattedAnswer = answer;

    if (step.input?.type === 'text' && step.input?.dataType) {
      // Apply formatting based on data type (e.g., title case for names)
      formattedAnswer = formatByDataType(answer, step.input.dataType);

      // For phone validation, check if there's a country code in collected data
      let countryCodeForValidation: string | undefined = undefined;
      if (step.input.dataType === 'phone') {
        // Look for any collected variable that might be a country code
        // Format is now "Country Name|+Code" (e.g., "United States|+1")
        for (const [, value] of Object.entries(collectedData)) {
          if (typeof value === 'string') {
            // Check if it's the new format with pipe separator
            if (value.includes('|') && value.split('|')[1]?.startsWith('+')) {
              countryCodeForValidation = value.split('|')[1];
              break;
            }
            // Legacy support: check if it's just a code starting with +
            if (value.startsWith('+')) {
              countryCodeForValidation = value;
              break;
            }
          }
        }
      }

      const validation = validateInput(formattedAnswer, step.input.dataType, countryCodeForValidation);
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: validation.error,
            validationError: true
          },
          { status: 400 }
        );
      }
    }

    // Save formatted answer
    if (step.collect?.enabled && step.collect.variableName) {
      await submission.addAnswer(
        stepId,
        formattedAnswer,
        step.collect.variableName
      );
    } else {
      await submission.addAnswer(stepId, formattedAnswer);
    }

    // Track conversion if enabled
    if (step.tracking?.conversionEvent) {
      await submission.addConversion(stepId);
    }

    // Get updated collected data after saving answer
    collectedData = Object.fromEntries(
      Array.from(submission.data.entries())
    ) as Record<string, unknown>;

    // Get next step
    const nextStep = getNextStep(step, form.steps, collectedData);

    // If no next step, mark as complete
    if (!nextStep) {
      await submission.complete();
      await form.incrementCompletions();

      // Send email notification if enabled
      if (form.settings?.emailNotifications) {
        try {
          // Get form owner's email
          const formOwner = await User.findById(form.clientId);
          if (formOwner && formOwner.email) {
            await sendSubmissionNotification(formOwner.email, {
              formName: form.name,
              submissionId: String(submission._id),
              data: collectedData,
              submittedAt: format(new Date(), 'MMM d, yyyy HH:mm:ss'),
            });
          }
        } catch (emailError) {
          // Log but don't fail the submission if email fails
          console.error('Failed to send email notification:', emailError);
        }
      }

      return NextResponse.json(
        {
          success: true,
          isComplete: true,
          nextStep: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isComplete: false,
        nextStep,
        collectedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
