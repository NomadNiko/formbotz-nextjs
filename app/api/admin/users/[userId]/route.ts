import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const { userId } = await params;

    const body = await request.json();
    const { name, email, role, subscription } = body;

    if (userId === admin.id && role === 'client') {
      return NextResponse.json(
        { error: 'Cannot demote yourself from admin' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (subscription) updateData.subscription = subscription;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const { userId } = await params;

    if (userId === admin.id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    const user = await User.findById(userId);

    if (user?.role === 'admin' && adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin user' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
