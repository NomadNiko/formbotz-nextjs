import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import { FormAction } from '@/lib/db/models';
import { FormActionType } from '@/types';

// GET /api/form-actions - Get all form actions for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formActions = await FormAction.find({ clientId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ formActions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching form actions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/form-actions - Create new form action
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, config } = body;

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!type || !Object.values(FormActionType).includes(type)) {
      return NextResponse.json(
        { error: 'Valid action type is required' },
        { status: 400 }
      );
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'Configuration object is required' },
        { status: 400 }
      );
    }

    // Type-specific validation
    if (type === FormActionType.EMAIL) {
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
    } else if (type === FormActionType.API) {
      if (!config.targetUrl || typeof config.targetUrl !== 'string') {
        return NextResponse.json(
          { error: 'Target URL is required for API actions' },
          { status: 400 }
        );
      }

      // Validate URL format
      try {
        new URL(config.targetUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }

      if (!config.method || !['POST', 'PUT', 'PATCH'].includes(config.method)) {
        return NextResponse.json(
          { error: 'Valid HTTP method is required (POST, PUT, or PATCH)' },
          { status: 400 }
        );
      }

      if (config.headers && typeof config.headers !== 'object') {
        return NextResponse.json(
          { error: 'Headers must be an object' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const formAction = await FormAction.create({
      clientId: session.user.id,
      name,
      description: description || undefined,
      type,
      config,
    });

    return NextResponse.json({ formAction }, { status: 201 });
  } catch (error) {
    console.error('Error creating form action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
