import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import { Form, Submission } from '@/lib/db/models';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { formId } = await params;

    const { searchParams } = new URL(request.url);
    const deleteSubmissions = searchParams.get('deleteSubmissions') === 'true';

    if (deleteSubmissions) {
      await Submission.deleteMany({ formId });
    }

    await Form.findByIdAndDelete(formId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete form';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
