import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Form } from '@/lib/db/models';
import { v4 as uuidv4 } from 'uuid';
import { FormStatus } from '@/types';

// POST /api/forms/[formId]/duplicate - Duplicate a form
export async function POST(
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

    // Find the original form
    const originalForm = await Form.findById(formId);

    if (!originalForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Verify the user owns this form
    if (originalForm.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create new form name with " (Copy)" appended
    const newName = `${originalForm.name} (Copy)`;

    // Generate a unique public URL slug for the duplicate
    const slug = `${newName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().slice(0, 8)}`;

    // Create duplicate form with copied data but new ID, URL, and reset stats
    const duplicateForm = await Form.create({
      clientId: session.user.id,
      name: newName,
      description: originalForm.description,
      steps: originalForm.steps, // Deep copy all steps
      status: FormStatus.DRAFT, // Always start as draft for safety
      publicUrl: slug,
      settings: originalForm.settings, // Copy all settings
      stats: {
        // Reset stats to 0
        views: 0,
        starts: 0,
        completions: 0,
        completionRate: 0,
      },
    });

    return NextResponse.json(
      {
        form: duplicateForm,
        message: 'Form duplicated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error duplicating form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
