import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Form, Submission, User, FormAction } from '@/lib/db/models';
import { getNextStep } from '@/lib/utils/conditionalLogic';
import { validateInput } from '@/lib/utils/validation';
import { sendSubmissionNotification } from '@/lib/utils/email';
import { executeFormActions } from '@/lib/utils/formActions';
import { formatByDataType } from '@/lib/utils/formatting';
import { format } from 'date-fns';
import { SubmissionStatus, FormAction as IFormAction } from '@/types';

// POST /api/chat/[publicUrl]/answer - Submit an answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicUrl: string }> }
) {
  const { publicUrl } = await params;
  try {
    const body = await request.json();
    const { sessionId, stepId, answer, replayStepId } = body;

    if (!sessionId || !stepId) {
      return NextResponse.json(
        { error: 'Session ID and step ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find or create submission
    let submission = await Submission.findOne({ sessionId });

    if (!submission) {
      // This is the first answer - create submission now

      // Find form by publicUrl
      const form = await Form.findOne({
        publicUrl,
        status: 'published',
      });

      if (!form) {
        return NextResponse.json(
          { error: 'Form not found' },
          { status: 404 }
        );
      }

      // Create submission
      submission = await Submission.create({
        formId: form._id,
        sessionId,
        status: SubmissionStatus.IN_PROGRESS,
        data: new Map(),
        metadata: {
          startedAt: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          conversions: [],
          timeSpentPerStep: [],
        },
        stepHistory: [],
      });

      // Increment starts count on first answer
      await form.incrementStarts();
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

    // Determine which step to use for next step calculation
    // If we're in a replay context, use the replay step for navigation
    // Otherwise, use the current step
    let stepForNavigation = step;
    if (replayStepId) {
      const replayStep = form.steps.find((s: { id: string }) => s.id === replayStepId);
      if (replayStep) {
        stepForNavigation = replayStep;
      }
    }

    // Get next step
    const nextStep = getNextStep(stepForNavigation, form.steps, collectedData);

    // If no next step, mark as complete
    if (!nextStep) {
      await submission.complete();
      await form.incrementCompletions();

      // Execute form actions asynchronously (fire and forget)
      console.log('[AnswerRoute] Checking for form actions', {
        hasFormActions: !!form.formActions,
        formActionsLength: form.formActions?.length || 0,
        formActionIds: form.formActions
      });

      if (form.formActions && form.formActions.length > 0) {
        try {
          console.log('[AnswerRoute] Fetching form actions from database', {
            actionIds: form.formActions
          });

          const actions = await FormAction.find({
            _id: { $in: form.formActions }
          }).lean();

          console.log('[AnswerRoute] Form actions fetched from database', {
            expected: form.formActions.length,
            found: actions.length,
            actions: actions.map(a => ({
              id: a._id,
              name: a.name,
              type: a.type,
              hasConfig: !!a.config,
              configKeys: a.config ? Object.keys(a.config) : []
            }))
          });

          if (actions.length > 0) {
            console.log('[AnswerRoute] Starting form actions execution', {
              submissionId: String(submission._id),
              formName: form.name,
              dataKeys: Object.keys(collectedData)
            });

            // Execute actions asynchronously without awaiting
            executeFormActions(actions as unknown as IFormAction[], {
              formName: form.name,
              submissionId: String(submission._id),
              data: collectedData,
              submittedAt: format(new Date(), 'MMM d, yyyy HH:mm:ss'),
            }).catch((error) => {
              console.error('[AnswerRoute] Error executing form actions:', error);
            });
          } else {
            console.warn('[AnswerRoute] No form actions found in database despite form.formActions having IDs', {
              formActionIds: form.formActions
            });
          }
        } catch (actionError) {
          // Log but don't fail the submission if action execution fails
          console.error('[AnswerRoute] Failed to fetch/execute form actions:', actionError);
        }
      } else {
        console.log('[AnswerRoute] No form actions configured for this form');
      }

      // Send email notification if enabled (legacy support)
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
