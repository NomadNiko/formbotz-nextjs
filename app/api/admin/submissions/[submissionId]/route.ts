import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import { Submission } from '@/lib/db/models';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { submissionId } = await params;

    await Submission.findByIdAndDelete(submissionId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete submission';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
