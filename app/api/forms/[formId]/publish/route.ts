import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Form } from '@/lib/db/models';
import { FormStatus } from '@/types';

// POST /api/forms/[formId]/publish - Publish or unpublish a form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // 'publish' or 'unpublish'

    if (!action || !['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "publish" or "unpublish"' },
        { status: 400 }
      );
    }

    await connectDB();

    const { formId } = await params;
    const form = await Form.findOne({
      _id: formId,
      clientId: session.user.id,
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Validate form has at least one step before publishing
    if (action === 'publish' && (!form.steps || form.steps.length === 0)) {
      return NextResponse.json(
        { error: 'Cannot publish form without any steps' },
        { status: 400 }
      );
    }

    form.status =
      action === 'publish' ? FormStatus.PUBLISHED : FormStatus.DRAFT;
    await form.save();

    return NextResponse.json(
      {
        form,
        message:
          action === 'publish'
            ? 'Form published successfully'
            : 'Form unpublished successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error publishing/unpublishing form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
