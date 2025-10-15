import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Form } from '@/lib/db/models';
import { v4 as uuidv4 } from 'uuid';

// PATCH /api/forms/[formId]/rename - Rename a form and update its public URL
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Form name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const { formId } = await params;

    // Find the form
    const form = await Form.findById(formId);

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Verify the user owns this form
    if (form.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate a new unique public URL slug based on the new name
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().slice(0, 8)}`;

    // Update form name and public URL
    form.name = name.trim();
    form.publicUrl = slug;

    await form.save();

    return NextResponse.json(
      {
        form,
        message: 'Form renamed successfully. Public URL has been updated.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error renaming form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
