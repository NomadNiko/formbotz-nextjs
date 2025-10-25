import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { FormAction, Form } from '@/lib/db/models';
import { FormActionType } from '@/types';

// GET /api/form-actions/:id - Get single form action
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formAction = await FormAction.findOne({
      _id: id,
      clientId: session.user.id,
    }).lean();

    if (!formAction) {
      return NextResponse.json(
        { error: 'Form action not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ formAction }, { status: 200 });
  } catch (error) {
    console.error('Error fetching form action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/form-actions/:id - Update form action
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, config } = body;

    await connectDB();

    // Check if action exists and user owns it
    const existingAction = await FormAction.findOne({
      _id: id,
      clientId: session.user.id,
    });

    if (!existingAction) {
      return NextResponse.json(
        { error: 'Form action not found' },
        { status: 404 }
      );
    }

    // Validation
    if (name !== undefined && (typeof name !== 'string' || name.length < 3)) {
      return NextResponse.json(
        { error: 'Name must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (type !== undefined && !Object.values(FormActionType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Type-specific validation for config
    if (config !== undefined) {
      const actionType = type || existingAction.type;

      if (actionType === FormActionType.EMAIL) {
        if (!Array.isArray(config.recipients) || config.recipients.length === 0) {
          return NextResponse.json(
            { error: 'At least one email recipient is required' },
            { status: 400 }
          );
        }

        // Validate email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const email of config.recipients) {
          if (!emailRegex.test(email)) {
            return NextResponse.json(
              { error: `Invalid email address: ${email}` },
              { status: 400 }
            );
          }
        }
      } else if (actionType === FormActionType.API) {
        if (config.targetUrl !== undefined) {
          try {
            new URL(config.targetUrl);
          } catch {
            return NextResponse.json(
              { error: 'Invalid URL format' },
              { status: 400 }
            );
          }
        }

        if (config.method !== undefined && !['POST', 'PUT', 'PATCH'].includes(config.method)) {
          return NextResponse.json(
            { error: 'Valid HTTP method is required (POST, PUT, or PATCH)' },
            { status: 400 }
          );
        }

        if (config.headers !== undefined && typeof config.headers !== 'object') {
          return NextResponse.json(
            { error: 'Headers must be an object' },
            { status: 400 }
          );
        }
      }
    }

    // Update action
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;
    if (config !== undefined) updates.config = config;

    const formAction = await FormAction.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ formAction }, { status: 200 });
  } catch (error) {
    console.error('Error updating form action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/form-actions/:id - Delete form action
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if action exists and user owns it
    const formAction = await FormAction.findOne({
      _id: id,
      clientId: session.user.id,
    });

    if (!formAction) {
      return NextResponse.json(
        { error: 'Form action not found' },
        { status: 404 }
      );
    }

    // Remove action from all forms that reference it
    await Form.updateMany(
      { formActions: id },
      { $pull: { formActions: id } }
    );

    // Delete the action
    await FormAction.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Form action deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting form action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
