import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Form, Submission } from '@/lib/db/models';

// GET /api/forms/[formId]/submissions - Get all submissions for a form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { formId } = await params;
    // Verify form ownership
    const form = await Form.findOne({
      _id: formId,
      clientId: session.user.id,
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Get all submissions
    const submissions = await Submission.find({ formId })
      .sort({ 'metadata.completedAt': -1 })
      .lean();

    // Convert Map to Object for JSON serialization (if needed)
    const submissionsWithData = submissions.map((sub: Record<string, unknown> & { _id: unknown; data?: unknown }) => ({
      ...sub,
      _id: String(sub._id),
      data: sub.data || {},
    }));

    return NextResponse.json(
      {
        submissions: submissionsWithData,
        form: {
          _id: form._id,
          name: form.name,
        },
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
