import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import { Form, User } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const clientId = searchParams.get('clientId') || '';

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;

    const skip = (page - 1) * limit;
    const total = await Form.countDocuments(query);
    const forms = await Form.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const clientIds = [...new Set(forms.map(f => f.clientId))];
    const clients = await User.find({ _id: { $in: clientIds } })
      .select('_id name email')
      .lean();

    const clientMap = new Map(clients.map(c => [String(c._id), c]));

    const formsWithClients = forms.map(form => ({
      ...form,
      client: clientMap.get(form.clientId),
    }));

    return NextResponse.json({
      forms: formsWithClients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch forms';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
