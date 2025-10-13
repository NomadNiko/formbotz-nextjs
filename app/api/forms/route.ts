import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { Form } from '@/lib/db/models';
import { v4 as uuidv4 } from 'uuid';
import { FormStatus } from '@/types';

// GET /api/forms - List all forms for the authenticated user
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const forms = await Form.find({ clientId: session.user.id })
      .sort({ updatedAt: -1 })
      .select('-steps'); // Don't return full steps in list view

    return NextResponse.json({ forms }, { status: 200 });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Form name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate a unique public URL slug
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().slice(0, 8)}`;

    const form = await Form.create({
      clientId: session.user.id,
      name,
      description: description || '',
      steps: [],
      status: FormStatus.DRAFT,
      publicUrl: slug,
      settings: {
        enableProgressBar: true,
        allowBackNavigation: true,
      },
      stats: {
        views: 0,
        starts: 0,
        completions: 0,
        completionRate: 0,
      },
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
