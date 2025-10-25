import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Form } from '@/lib/db/models';

// GET /api/forms/[formId] - Get a specific form
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
    const form = await Form.findOne({
      _id: formId,
      clientId: session.user.id,
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ form }, { status: 200 });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/forms/[formId] - Update a form
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
    const { name, description, steps, settings, status, formActions } = body;

    await connectDB();

    const { formId } = await params;
    const form = await Form.findOne({
      _id: formId,
      clientId: session.user.id,
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Update only provided fields
    if (name !== undefined) form.name = name;
    if (description !== undefined) form.description = description;
    if (steps !== undefined) form.steps = steps;
    if (settings !== undefined) form.settings = { ...form.settings, ...settings };
    if (status !== undefined) form.status = status;
    if (formActions !== undefined) form.formActions = formActions;

    await form.save();

    return NextResponse.json({ form }, { status: 200 });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[formId] - Delete a form
export async function DELETE(
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
    const form = await Form.findOneAndDelete({
      _id: formId,
      clientId: session.user.id,
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Form deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
