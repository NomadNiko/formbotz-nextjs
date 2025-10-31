import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Form, Submission } from '@/lib/db/models';
import { v4 as uuidv4 } from 'uuid';
import { SubmissionStatus } from '@/types';

// POST /api/chat/[publicUrl]/session - Start or resume a chat session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicUrl: string }> }
) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    await connectDB();

    const { publicUrl } = await params;
    // Find the published form
    const form = await Form.findOne({
      publicUrl,
      status: 'published',
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or not published' },
        { status: 404 }
      );
    }

    // Increment view count
    await form.incrementViews();

    // If resuming existing session
    if (sessionId) {
      const submission = await Submission.findOne({ sessionId });

      if (submission && submission.status !== SubmissionStatus.COMPLETED) {
        return NextResponse.json(
          {
            sessionId: submission.sessionId,
            form: {
              _id: form._id,
              name: form.name,
              displayName: form.displayName,
              settings: form.settings,
              steps: form.steps,
            },
            currentStepIndex: submission.stepHistory.length,
            collectedData: submission.data as Record<string, unknown>,
          },
          { status: 200 }
        );
      }
    }

    // Create new session (but don't save to database yet)
    // Submission will be created on first answer to avoid empty submissions
    const newSessionId = uuidv4();

    return NextResponse.json(
      {
        sessionId: newSessionId,
        form: {
          _id: form._id,
          name: form.name,
          displayName: form.displayName,
          settings: form.settings,
          steps: form.steps,
        },
        currentStepIndex: 0,
        collectedData: {},
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error starting chat session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
