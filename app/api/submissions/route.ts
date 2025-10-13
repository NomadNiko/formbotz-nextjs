import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Form, Submission } from '@/lib/db/models';

// GET /api/submissions - Get all submissions for the current user's forms
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all forms owned by this user
    const userForms = await Form.find({ clientId: session.user.id }).lean();
    const formIds = userForms.map((form) => String(form._id));

    // Get all submissions for these forms
    const submissions = await Submission.find({
      formId: { $in: formIds },
    })
      .sort({ 'metadata.completedAt': -1, 'metadata.startedAt': -1 })
      .lean();

    // Create a map of formId to form name
    const formMap = new Map();
    userForms.forEach((form) => {
      formMap.set(String(form._id), form.name);
    });

    // Add form name to each submission
    const submissionsWithFormNames = submissions.map(
      (
        sub: Record<string, unknown> & {
          _id: unknown;
          formId: unknown;
          data?: unknown;
        }
      ) => ({
        ...sub,
        _id: String(sub._id),
        formId: String(sub.formId),
        formName: formMap.get(String(sub.formId)) || 'Unknown Form',
        data: sub.data || {},
      })
    );

    return NextResponse.json(
      {
        submissions: submissionsWithFormNames,
        totalForms: userForms.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
